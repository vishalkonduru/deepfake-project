import uuid
import asyncio
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from pathlib import Path

from config import MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS
from utils.validators import validate_video_file
from utils.file_handler import save_upload
from routers.jobs import jobs, JobStatus, run_pipeline, PIPELINE_STEPS

router = APIRouter()


@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    # Read file content first to check size
    file_content = await file.read()
    file_size = len(file_content)

    # Validate
    validate_video_file(file, file_size)

    # Check extension if content-type missing
    filename = file.filename or "upload.mp4"
    ext = Path(filename).suffix.lower()
    if not ext:
        ext = ".mp4"
        filename = filename + ext

    # Generate job ID
    job_id = str(uuid.uuid4())

    # Save to disk
    video_path = await save_upload(file_content, job_id, filename)

    # Create job record
    jobs[job_id] = {
        "status": JobStatus.QUEUED,
        "progress": 0.0,
        "current_step": PIPELINE_STEPS[0],
        "step_index": 0,
        "filename": filename,
        "error": None,
        "result": None,
    }

    # Start background pipeline
    background_tasks.add_task(run_pipeline, job_id, video_path, filename)

    return {"job_id": job_id, "status": "queued", "filename": filename}
