# TruthLens — AI Deepfake Video Detection Platform

TruthLens is a production-grade, AI-powered deepfake video detection platform. Upload a video, and TruthLens returns a verdict (REAL / DEEPFAKE / UNCERTAIN) with frame-level evidence, anomaly scores, and artifact classification — all with explainable results.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (Python 3.11) |
| ML Pipeline | OpenCV + MediaPipe + ONNX Runtime (EfficientNet-B4) |
| Deployment | Frontend on Vercel, Backend on Render via Docker |
| State | React hooks + axios polling |

---

## Quick Start (Docker Compose)

```bash
git clone https://github.com/your-org/truthlens
cd truthlens

# Start everything (demo mode, no model needed)
docker-compose up --build
```

Open [http://localhost](http://localhost) in your browser.

- The app runs fully in **DEMO_MODE=true** by default — no ONNX model required.
- Demo mode simulates the full pipeline with realistic delays and returns cached sample results.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DEMO_MODE` | `true` | Skip real inference, return cached results after simulated delay |
| `PORT` | `8000` | Port for the uvicorn server |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `` (empty = same origin) | Backend API base URL. Set to your Render URL for Vercel deploys. |

Copy `frontend/.env.example` to `frontend/.env` and fill in values.

---

## Running Locally (Development)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
DEMO_MODE=true uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/frames` to `http://localhost:8000` automatically.

---

## Using the Real ONNX Model

To run full inference instead of demo mode:

1. Download or train an EfficientNet-B4 deepfake detection model in ONNX format.
   - Recommended: [FaceForensics++ EfficientNet checkpoint](https://github.com/ondyari/FaceForensics)
   - Export with `torch.onnx.export()` — input shape `[N, 3, 224, 224]`, output `[N, 1]` logits
2. Place the file at `backend/models/efficientnet_b4_deepfake.onnx`
3. Set `DEMO_MODE=false` in your environment
4. Restart the backend

```bash
DEMO_MODE=false uvicorn main:app --reload
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload` | Upload a video file. Returns `{job_id, status}` |
| `GET` | `/api/job/{job_id}` | Poll job status and progress |
| `GET` | `/api/result/{job_id}` | Get full analysis result |
| `GET` | `/api/samples` | Get sample video URLs |
| `GET` | `/api/health` | Health check + model status |

### Upload example

```bash
curl -X POST http://localhost:8000/api/upload \
  -F "file=@test_video.mp4"
```

### Response

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "filename": "test_video.mp4"
}
```

### Result format

```json
{
  "job_id": "...",
  "filename": "test_video.mp4",
  "verdict": "DEEPFAKE",
  "confidence": 0.874,
  "frames_analyzed": 58,
  "faces_detected": 44,
  "processing_time_ms": 18320,
  "video_score": 0.8741,
  "artifacts": ["face_boundary_mismatch", "blending_inconsistency"],
  "suspicious_frames": [
    {
      "frame_index": 7,
      "timestamp": 3.5,
      "score": 0.9421,
      "image_url": "/frames/job-id/frames/frame_0007.jpg",
      "artifacts": ["face_boundary_mismatch"]
    }
  ]
}
```

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
# Set VITE_API_URL=https://your-backend.onrender.com in Vercel env vars
```

### Backend → Render

1. Create a new Web Service on Render
2. Point to `./backend`
3. Set Docker as build method
4. Environment vars: `DEMO_MODE=false` (or true for demo)
5. The Dockerfile handles all system dependencies

---

## Pipeline Architecture

```
Video Upload
    │
    ▼
Frame Extraction (OpenCV, 2fps, max 60 frames)
    │
    ▼
Face Detection (MediaPipe BlazeFace)
    │
    ▼
Face Crop Preprocessing (224×224 RGB, ImageNet normalization)
    │
    ▼
EfficientNet-B4 Inference (ONNX Runtime, CPU)
    │
    ▼
Score Aggregation (70th percentile of per-frame scores)
    │
    ▼
Verdict + Artifact Classification (rule-based explainability)
    │
    ▼
Result JSON + Frame Crop JPEGs (served via /frames/)
```

---

## Responsible Use

TruthLens is a probabilistic AI tool. Results **must not** be used as sole evidence in legal, journalistic, employment, or law enforcement decisions. Human expert review is always required. See Section 7 of the app for the full disclaimer.

---

## License

MIT License. Not for production use without independent validation and human review oversight.
