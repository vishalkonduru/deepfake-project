from pathlib import Path
from fastapi import UploadFile, HTTPException
from config import MAX_FILE_SIZE_BYTES, ALLOWED_EXTENSIONS, ALLOWED_CONTENT_TYPES


def validate_video_file(file: UploadFile, file_size: int):
    """Validate uploaded video file type and size."""
    # Check content type
    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: MP4, MOV, AVI."
        )

    # Check extension
    ext = Path(file.filename).suffix.lower() if file.filename else ""
    if ext and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '{ext}'. Allowed: .mp4, .mov, .avi"
        )

    # Check size
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is 50MB, got {file_size / (1024*1024):.1f}MB."
        )
