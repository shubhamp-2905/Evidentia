from typing import List, Optional, Literal
from pydantic import BaseModel, UUID4
from datetime import datetime

class UploadResponse(BaseModel):
    filename: str
    content_type: str
    message: str
    document_id: UUID4

class DocumentInfo(BaseModel):
    id: UUID4
    filename: str
    content_type: str
    upload_timestamp: datetime
    chunk_count: int

class Citation(BaseModel):
    source_file: str
    page: Optional[int] = None
    timestamp: Optional[str] = None
    snippet: str
    score: float

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5

class QueryResponse(BaseModel):
    answer: str
    citations: List[Citation]
    processing_time: float
