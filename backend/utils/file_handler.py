import asyncio
import shutil
from pathlib import Path
from config import TEMP_DIR, CLEANUP_AFTER_SECONDS


async def save_upload(file_data: bytes, job_id: str, filename: str) -> Path:
    """Save uploaded file to temp directory."""
    job_dir = TEMP_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    ext = Path(filename).suffix.lower() or ".mp4"
    file_path = job_dir / f"input{ext}"

    with open(file_path, "wb") as f:
        f.write(file_data)

    return file_path


def get_frame_path(job_id: str, frame_index: int) -> Path:
    """Get path where frame crop JPEG should be saved."""
    job_dir = TEMP_DIR / job_id / "frames"
    job_dir.mkdir(parents=True, exist_ok=True)
    return job_dir / f"frame_{frame_index:04d}.jpg"


async def schedule_cleanup(job_id: str):
    """Schedule cleanup of temp files after delay."""
    await asyncio.sleep(CLEANUP_AFTER_SECONDS)
    cleanup_job(job_id)


def cleanup_job(job_id: str):
    """Remove temp directory for a job."""
    job_dir = TEMP_DIR / job_id
    if job_dir.exists():
        shutil.rmtree(job_dir, ignore_errors=True)
