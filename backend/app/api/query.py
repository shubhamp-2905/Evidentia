from fastapi import APIRouter, HTTPException
from app.models import QueryRequest, QueryResponse
from app.services.generation import generation_service
import time

router = APIRouter()

@router.post("/", response_model=QueryResponse)
async def query(request: QueryRequest):
    start_time = time.time()
    
    try:
        result = await generation_service.generate_answer(request.query)
        
        processing_time = time.time() - start_time
        
        return QueryResponse(
            answer=result['answer'],
            citations=result['citations'],
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
