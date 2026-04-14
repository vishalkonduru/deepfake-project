import numpy as np
from typing import List, Optional, Tuple
import cv2

# Try importing mediapipe; fall back gracefully
try:
    import mediapipe as mp
    _mp_face = mp.solutions.face_detection
    _MEDIAPIPE_AVAILABLE = True
except Exception:
    _MEDIAPIPE_AVAILABLE = False


def detect_faces(frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """
    Detect face bounding boxes in a single frame.
    Returns list of (x, y, w, h) tuples.
    Falls back to OpenCV Haar cascade if MediaPipe unavailable.
    """
    if _MEDIAPIPE_AVAILABLE:
        return _detect_mediapipe(frame)
    return _detect_haar(frame)


def _detect_mediapipe(frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
    h, w = frame.shape[:2]
    with _mp_face.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
        results = face_detection.process(frame)
        if not results.detections:
            return []
        boxes = []
        for det in results.detections:
            bbox = det.location_data.relative_bounding_box
            x = max(0, int(bbox.xmin * w))
            y = max(0, int(bbox.ymin * h))
            bw = int(bbox.width * w)
            bh = int(bbox.height * h)
            boxes.append((x, y, bw, bh))
        return boxes


def _detect_haar(frame: np.ndarray) -> List[Tuple[int, int, int, int]]:
    gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    if len(faces) == 0:
        return []
    return [(int(x), int(y), int(w), int(h)) for x, y, w, h in faces]


def crop_face(frame: np.ndarray, bbox: Tuple[int, int, int, int], padding: float = 0.2) -> np.ndarray:
    """Crop face region with padding."""
    h, w = frame.shape[:2]
    x, y, bw, bh = bbox

    pad_x = int(bw * padding)
    pad_y = int(bh * padding)

    x1 = max(0, x - pad_x)
    y1 = max(0, y - pad_y)
    x2 = min(w, x + bw + pad_x)
    y2 = min(h, y + bh + pad_y)

    return frame[y1:y2, x1:x2]
