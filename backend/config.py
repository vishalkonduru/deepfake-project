import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
TEMP_DIR = BASE_DIR / "temp"
MODELS_DIR = BASE_DIR / "models"
SAMPLE_RESULTS_DIR = BASE_DIR / "sample_results"

TEMP_DIR.mkdir(exist_ok=True)

DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
MODEL_PATH = MODELS_DIR / "efficientnet_b4_deepfake.onnx"

MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".avi"}
ALLOWED_CONTENT_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo", "video/avi"}

SAMPLE_REAL_URL = "https://www.w3schools.com/html/mov_bbb.mp4"
SAMPLE_DEEPFAKE_URL = "https://www.w3schools.com/html/movie.mp4"

FRAMES_PER_SECOND = 2
MAX_FRAMES = 60

DEEPFAKE_THRESHOLD = 0.65
REAL_THRESHOLD = 0.35

CLEANUP_AFTER_SECONDS = 600  # 10 minutes
