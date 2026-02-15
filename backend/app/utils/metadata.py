import uuid
from datetime import datetime
from app.models import DocumentInfo

def generate_document_id() -> uuid.UUID:
    return uuid.uuid4()

def create_metadata(doc_id: str, filename: str, content_type: str, page: int = None, timestamp: str = None, chunk_id: int = 0):
    return {
        "id": str(doc_id),
        "filename": filename,
        "content_type": content_type,
        "page": page,
        "timestamp": timestamp,
        "chunk_id": chunk_id,
        "upload_time": datetime.utcnow().isoformat()
    }
