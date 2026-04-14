import numpy as np
import cv2
from pathlib import Path
from typing import List, Optional
from config import MODEL_PATH

_session = None
_model_loaded = False


def load_model() -> bool:
    """Load ONNX model. Returns True if successful."""
    global _session, _model_loaded
    try:
        import onnxruntime as ort
        if MODEL_PATH.exists():
            _session = ort.InferenceSession(str(MODEL_PATH), providers=["CPUExecutionProvider"])
            _model_loaded = True
            return True
    except Exception as e:
        print(f"Could not load ONNX model: {e}")
    _model_loaded = False
    return False


def is_model_loaded() -> bool:
    return _model_loaded


def preprocess_face(face_crop: np.ndarray) -> np.ndarray:
    """Preprocess face crop for EfficientNet-B4 (224x224, normalized)."""
    resized = cv2.resize(face_crop, (224, 224))
    img = resized.astype(np.float32) / 255.0
    # ImageNet normalization
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img = (img - mean) / std
    # NCHW format
    img = np.transpose(img, (2, 0, 1))
    return img


def run_inference(face_crops: List[np.ndarray]) -> List[float]:
    """
    Run batch inference on face crops.
    Returns list of deepfake probability scores (0=real, 1=deepfake).
    Falls back to mock if model not loaded.
    """
    if not _model_loaded or _session is None:
        return _mock_inference(face_crops)

    scores = []
    batch = np.stack([preprocess_face(crop) for crop in face_crops], axis=0)
    input_name = _session.get_inputs()[0].name
    outputs = _session.run(None, {input_name: batch})
    logits = outputs[0]

    # Apply sigmoid if raw logits
    probs = 1 / (1 + np.exp(-logits[:, 0])) if logits.shape[1] == 1 else logits[:, 1]
    return probs.tolist()


def _mock_inference(face_crops: List[np.ndarray]) -> List[float]:
    """
    Mock inference generating plausible scores.
    Uses face crop pixel statistics for deterministic-ish results.
    """
    scores = []
    for crop in face_crops:
        # Use pixel statistics to seed variation
        mean_val = float(np.mean(crop)) / 255.0
        std_val = float(np.std(crop)) / 255.0
        # Generate score with some randomness but correlation to image stats
        rng = np.random.default_rng(int(mean_val * 1000 + std_val * 100))
        base = rng.normal(0.5, 0.2)
        score = float(np.clip(base, 0.0, 1.0))
        scores.append(score)
    return scores
