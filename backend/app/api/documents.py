from fastapi import APIRouter
from app.services.vector_store import VectorStore
from typing import List, Dict

router = APIRouter()

@router.get("/", response_model=List[Dict])
async def list_documents():
    # Group metadata by document ID to list unique files
    docs = {}
    
    for meta in VectorStore.metadata:
        doc_id = meta.get('id')
        if doc_id not in docs:
            docs[doc_id] = {
                "id": doc_id,
                "filename": meta.get('filename'),
                "content_type": meta.get('content_type'),
                "upload_time": meta.get('upload_time'),
                "chunk_count": 0
            }
        docs[doc_id]["chunk_count"] += 1
        
    return list(docs.values())
