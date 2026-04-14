import cv2
import numpy as np
from pathlib import Path
from typing import List, Tuple
from config import FRAMES_PER_SECOND, MAX_FRAMES


def extract_frames(video_path: Path) -> Tuple[List[np.ndarray], List[float]]:
    """
    Extract frames from video at specified FPS.
    Returns (frames_list, timestamps_list)
    """
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"Could not open video file: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0

    # Calculate frame interval
    frame_interval = max(1, int(fps / FRAMES_PER_SECOND))

    frames = []
    timestamps = []
    frame_count = 0

    while len(frames) < MAX_FRAMES:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            timestamp = frame_count / fps
            frames.append(rgb_frame)
            timestamps.append(timestamp)

        frame_count += 1

    cap.release()
    return frames, timestamps
