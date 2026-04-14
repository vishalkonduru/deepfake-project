from typing import List


ARTIFACT_CHIPS = {
    "face_boundary_mismatch": "Face boundary mismatch",
    "blending_inconsistency": "Blending inconsistency",
    "texture_anomaly": "Texture anomaly",
    "temporal_instability": "Temporal instability",
    "unnatural_transition": "Unnatural transition",
}


def assign_artifacts(score: float) -> List[str]:
    """
    Rule-based artifact assignment based on anomaly score.
    Returns list of artifact keys.
    """
    if score > 0.85:
        return [
            "face_boundary_mismatch",
            "blending_inconsistency",
            "texture_anomaly",
            "temporal_instability",
            "unnatural_transition",
        ]
    elif score > 0.70:
        return ["face_boundary_mismatch", "temporal_instability"]
    elif score > 0.50:
        return ["texture_anomaly"]
    elif score > 0.35:
        return ["texture_anomaly"]
    return []


def get_artifact_labels(artifact_keys: List[str]) -> List[str]:
    """Convert artifact keys to display labels."""
    return [ARTIFACT_CHIPS.get(k, k) for k in artifact_keys]


def get_video_level_artifacts(video_score: float) -> List[str]:
    """Get artifact chips for the video-level verdict card."""
    if video_score > 0.85:
        return list(ARTIFACT_CHIPS.keys())
    elif video_score > 0.70:
        return ["face_boundary_mismatch", "blending_inconsistency"]
    elif video_score > 0.50:
        return ["texture_anomaly"]
    return []
