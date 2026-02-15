import asyncio
import os
import sys

from dotenv import load_dotenv

# Load env from backend/.env
backend_env = os.path.join(os.path.dirname(__file__), 'backend', '.env')
load_dotenv(backend_env)

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.services.generation import generation_service
from app.services.vector_store import VectorStore

async def debug_query():
    print("Loading Vector Store...")
    VectorStore.load_index()
    print(f"Index size: {VectorStore.index.ntotal if VectorStore.index else 0}")
    
    query = "give me operating system notes pdf"
    print(f"\nRunning Query: {query}")
    
    try:
        result = await generation_service.generate_answer(query)
        print("\n--- Result ---")
        print(result)
    except Exception as e:
        print("\n!!! ERROR !!!")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_query())
