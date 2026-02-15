import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    UPLOAD_DIR: Path = DATA_DIR / "uploads"
    FAISS_INDEX_DIR: Path = DATA_DIR / "faiss_index"
    METADATA_DIR: Path = DATA_DIR / "metadata"
    
    # Models
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    IMAGE_EMBEDDING_MODEL: str = "clip-ViT-B-32"
    GENERATION_MODEL: str = "gemini-flash-latest"
    
    # Processing
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    
    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.FAISS_INDEX_DIR, exist_ok=True)
os.makedirs(settings.METADATA_DIR, exist_ok=True)
