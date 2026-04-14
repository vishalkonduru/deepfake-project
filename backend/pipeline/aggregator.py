import numpy as np
from typing import List, Dict, Any, Tuple
from config import DEEPFAKE_THRESHOLD, REAL_THRESHOLD


def aggregate_scores(
    frame_scores: List[Dict[str, Any]]
) -> Tuple[str, float, List[Dict[str, Any]]]:
    """
    Aggregate per-frame scores to produce video-level verdict.

    frame_scores: list of {frame_index, timestamp, score, image_url}
    Returns: (verdict, confidence, top_suspicious_frames)
    """
    if not frame_scores:
        return "UNCERTAIN", 0.5, []

    scores = [f["score"] for f in frame_scores]
    scores_arr = np.array(scores)

    # Use 70th percentile (top 30% of scores)
    video_score = float(np.percentile(scores_arr, 70))

    # Determine verdict
    if video_score >= DEEPFAKE_THRESHOLD:
        verdict = "DEEPFAKE"
        confidence = video_score
    elif video_score <= REAL_THRESHOLD:
        verdict = "REAL"
        confidence = 1.0 - video_score
    else:
        verdict = "UNCERTAIN"
        # Confidence reflects how far from center
        distance = abs(video_score - 0.5)
        confidence = 0.4 + distance * 0.4

    # Sort frames by score descending, take top 5
    sorted_frames = sorted(frame_scores, key=lambda x: x["score"], reverse=True)
    top_frames = sorted_frames[:5]

    return verdict, round(confidence, 4), top_frames


def compute_verdict_label(verdict: str, confidence: float) -> str:
    """Return display label for verdict."""
    if verdict == "DEEPFAKE":
        return "LIKELY DEEPFAKE"
    elif verdict == "REAL":
        return "LIKELY REAL"
    return "UNCERTAIN"


def confidence_band(confidence: float) -> str:
    if confidence >= 0.80:
        return "High confidence"
    elif confidence >= 0.60:
        return "Moderate confidence"
    return "Low confidence"
