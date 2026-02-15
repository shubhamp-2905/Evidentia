from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from app.config import settings
from app.api import upload, query, documents
from app.services.vector_store import VectorStore

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load FAISS index
    logger.info("Loading FAISS index...")
    VectorStore.load_index()
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Multimodal RAG System",
    description="RAG system for text, images, and audio using Gemini API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(query.router, prefix="/query", tags=["Query"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "model": settings.GENERATION_MODEL}

# Mount Frontend
# Mount Frontend
from fastapi.staticfiles import StaticFiles

# Serve Uploaded Files
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

frontend_path = settings.BASE_DIR.parent / "frontend"
app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
