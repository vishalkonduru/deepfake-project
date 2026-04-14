from fastapi import APIRouter
from config import SAMPLE_REAL_URL, SAMPLE_DEEPFAKE_URL

router = APIRouter()


@router.get("/samples")
async def get_samples():
    return [
        {
            "id": "real",
            "label": "Real video sample",
            "url": SAMPLE_REAL_URL,
            "description": "An authentic, unmanipulated video clip.",
        },
        {
            "id": "deepfake",
            "label": "Deepfake sample",
            "url": SAMPLE_DEEPFAKE_URL,
            "description": "A video with face-swap manipulation artifacts.",
        },
    ]
