from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from config import TEMP_DIR, DEMO_MODE
from pipeline.inference import load_model, is_model_loaded
from routers import upload, jobs, samples


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"TruthLens API starting — DEMO_MODE={DEMO_MODE}")
    TEMP_DIR.mkdir(exist_ok=True)
    load_model()
    print(f"Model loaded: {is_model_loaded()}")
    yield
    # Shutdown
    print("TruthLens API shutting down")


app = FastAPI(
    title="TruthLens API",
    description="AI-powered deepfake video detection platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins for hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving face crop images
app.mount("/frames", StaticFiles(directory=str(TEMP_DIR)), name="frames")

# Include routers
app.include_router(upload.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(samples.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": is_model_loaded(),
        "demo_mode": DEMO_MODE,
    }


@app.get("/")
async def root():
    return {"message": "TruthLens API", "docs": "/docs"}
