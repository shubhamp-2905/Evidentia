from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models import UploadResponse
from app.services.document_processor import document_processor
from app.services.audio_processor import audio_processor
from app.config import settings
import shutil
import os
from pathlib import Path

router = APIRouter()

@router.post("/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename
    content_type = file.content_type
    
    # Save file temporarily
    file_path = settings.UPLOAD_DIR / filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        doc_id = None
        if content_type.startswith("audio/"):
            doc_id = await audio_processor.process_audio(file_path, filename)
        else:
            # Assume document/image
            doc_id = await document_processor.process_file(file, file_path)
            
        return UploadResponse(
            filename=filename,
            content_type=content_type,
            message="File uploaded and processed successfully",
            document_id=doc_id
        )
        
    except Exception as e:
        # Check if file exists and remove it if processing failed? 
        # For debug, maybe keep it. But in prod, clean up.
        raise HTTPException(status_code=500, detail=str(e))
