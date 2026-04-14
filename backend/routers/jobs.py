from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import asyncio
import time
import json
import cv2
import numpy as np
from pathlib import Path
from PIL import Image

from config import DEMO_MODE, SAMPLE_RESULTS_DIR, TEMP_DIR
from pipeline.frame_extractor import extract_frames
from pipeline.face_detector import detect_faces, crop_face
from pipeline.inference import run_inference, is_model_loaded
from pipeline.aggregator import aggregate_scores
from pipeline.explainability import assign_artifacts, get_video_level_artifacts
from utils.file_handler import get_frame_path, schedule_cleanup

router = APIRouter()

# In-memory job store
jobs: Dict[str, Dict[str, Any]] = {}


class JobStatus:
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETE = "complete"
    FAILED = "failed"


PIPELINE_STEPS = [
    "Uploading video",
    "Sampling frames",
    "Detecting faces",
    "Running inference",
    "Generating report",
]


def get_job(job_id: str) -> Dict[str, Any]:
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found")
    return jobs[job_id]


@router.get("/job/{job_id}")
async def get_job_status(job_id: str):
    job = get_job(job_id)
    return {
        "job_id": job_id,
        "status": job["status"],
        "progress": job.get("progress", 0.0),
        "current_step": job.get("current_step", ""),
        "step_index": job.get("step_index", 0),
        "total_steps": len(PIPELINE_STEPS),
        "error": job.get("error"),
    }


@router.get("/result/{job_id}")
async def get_result(job_id: str):
    job = get_job(job_id)
    if job["status"] != JobStatus.COMPLETE:
        raise HTTPException(status_code=400, detail="Job not complete yet")
    return job.get("result", {})


async def run_pipeline(job_id: str, video_path: Path, filename: str):
    """Full analysis pipeline running as background task."""
    job = jobs[job_id]

    def update_step(index: int, progress: float):
        job["status"] = JobStatus.PROCESSING
        job["step_index"] = index
        job["current_step"] = PIPELINE_STEPS[index]
        job["progress"] = progress

    try:
        start_time = time.time()

        # DEMO MODE: return cached result after simulated delay
        if DEMO_MODE:
            await _run_demo_pipeline(job_id, filename)
            asyncio.create_task(schedule_cleanup(job_id))
            return

        # Step 0: Upload done (already done)
        update_step(0, 0.05)
        await asyncio.sleep(0.5)

        # Step 1: Extract frames
        update_step(1, 0.15)
        loop = asyncio.get_event_loop()
        frames, timestamps = await loop.run_in_executor(None, extract_frames, video_path)

        if not frames:
            raise RuntimeError("No frames could be extracted from the video")

        # Step 2: Detect faces
        update_step(2, 0.35)
        frame_data = []
        faces_detected = 0

        for i, (frame, ts) in enumerate(zip(frames, timestamps)):
            bboxes = await loop.run_in_executor(None, detect_faces, frame)
            if bboxes:
                best_bbox = max(bboxes, key=lambda b: b[2] * b[3])
                crop = crop_face(frame, best_bbox)
                frame_data.append({
                    "frame_index": i,
                    "timestamp": ts,
                    "frame": frame,
                    "crop": crop,
                    "bbox": best_bbox,
                })
                faces_detected += 1

        if not frame_data:
            # No faces found - treat as real with low confidence
            jobs[job_id]["status"] = JobStatus.COMPLETE
            jobs[job_id]["progress"] = 1.0
            jobs[job_id]["result"] = {
                "job_id": job_id,
                "verdict": "UNCERTAIN",
                "confidence": 0.45,
                "frames_analyzed": len(frames),
                "faces_detected": 0,
                "processing_time_ms": int((time.time() - start_time) * 1000),
                "suspicious_frames": [],
                "artifacts": [],
                "video_score": 0.45,
            }
            asyncio.create_task(schedule_cleanup(job_id))
            return

        # Step 3: Run inference
        update_step(3, 0.60)
        crops = [fd["crop"] for fd in frame_data]
        scores = await loop.run_in_executor(None, run_inference, crops)

        # Save face crop images
        frame_scores = []
        frames_dir = TEMP_DIR / job_id / "frames"
        frames_dir.mkdir(parents=True, exist_ok=True)

        for fd, score in zip(frame_data, scores):
            img_path = frames_dir / f"frame_{fd['frame_index']:04d}.jpg"
            crop_bgr = cv2.cvtColor(fd["crop"], cv2.COLOR_RGB2BGR)
            cv2.imwrite(str(img_path), crop_bgr)

            artifacts = assign_artifacts(score)
            frame_scores.append({
                "frame_index": fd["frame_index"],
                "timestamp": fd["timestamp"],
                "score": round(score, 4),
                "image_url": f"/frames/{job_id}/frames/frame_{fd['frame_index']:04d}.jpg",
                "artifacts": artifacts,
            })

        # Step 4: Aggregate and generate report
        update_step(4, 0.85)
        verdict, confidence, top_frames = aggregate_scores(frame_scores)

        # Compute video-level score for artifact chips
        all_scores = [f["score"] for f in frame_scores]
        video_score = float(np.percentile(all_scores, 70)) if all_scores else 0.5
        video_artifacts = get_video_level_artifacts(video_score)

        await asyncio.sleep(0.5)

        processing_time_ms = int((time.time() - start_time) * 1000)

        jobs[job_id]["status"] = JobStatus.COMPLETE
        jobs[job_id]["progress"] = 1.0
        jobs[job_id]["result"] = {
            "job_id": job_id,
            "filename": filename,
            "verdict": verdict,
            "confidence": confidence,
            "frames_analyzed": len(frames),
            "faces_detected": faces_detected,
            "processing_time_ms": processing_time_ms,
            "suspicious_frames": top_frames,
            "artifacts": video_artifacts,
            "video_score": round(video_score, 4),
        }

    except Exception as e:
        jobs[job_id]["status"] = JobStatus.FAILED
        jobs[job_id]["error"] = str(e)
        jobs[job_id]["progress"] = 0.0

    asyncio.create_task(schedule_cleanup(job_id))


async def _run_demo_pipeline(job_id: str, filename: str):
    """Simulated pipeline with realistic delays for demo mode."""
    job = jobs[job_id]
    steps_timing = [1.5, 3.0, 3.5, 5.0, 2.0]  # seconds per step

    for i, delay in enumerate(steps_timing):
        job["status"] = JobStatus.PROCESSING
        job["step_index"] = i
        job["current_step"] = PIPELINE_STEPS[i]
        job["progress"] = (i / len(PIPELINE_STEPS)) + 0.05
        await asyncio.sleep(delay)

    # Load appropriate sample result
    name_lower = filename.lower()
    if "real" in name_lower or "authentic" in name_lower:
        result_file = SAMPLE_RESULTS_DIR / "real_sample_result.json"
    else:
        result_file = SAMPLE_RESULTS_DIR / "deepfake_sample_result.json"

    if result_file.exists():
        with open(result_file) as f:
            result = json.load(f)
    else:
        # Fallback inline result
        result = _generate_mock_result(job_id, filename)

    result["job_id"] = job_id
    result["filename"] = filename

    job["status"] = JobStatus.COMPLETE
    job["progress"] = 1.0
    job["result"] = result


def _generate_mock_result(job_id: str, filename: str) -> dict:
    """Generate a plausible mock result."""
    import random
    rng = random.Random(hash(filename) % 10000)
    score = rng.uniform(0.72, 0.94)

    return {
        "job_id": job_id,
        "filename": filename,
        "verdict": "DEEPFAKE",
        "confidence": round(score, 4),
        "frames_analyzed": rng.randint(45, 60),
        "faces_detected": rng.randint(30, 50),
        "processing_time_ms": rng.randint(12000, 22000),
        "video_score": round(score, 4),
        "artifacts": ["face_boundary_mismatch", "blending_inconsistency", "texture_anomaly",
                      "temporal_instability", "unnatural_transition"],
        "suspicious_frames": [
            {
                "frame_index": i * 8 + rng.randint(0, 5),
                "timestamp": round(i * 4.2 + rng.uniform(0, 2), 2),
                "score": round(rng.uniform(0.78, 0.97), 4),
                "image_url": None,
                "artifacts": ["face_boundary_mismatch", "blending_inconsistency"],
            }
            for i in range(5)
        ],
    }
