from app.services.embeddings import embeddings_service
from app.services.vector_store import VectorStore
from app.models import Citation

class RetrievalService:
    def retrieve(self, query: str, k: int = 3):
        # Embed query
        query_embedding = embeddings_service.encode_text([query])[0]
        
        # Search Vector Store
        results = VectorStore.search(query_embedding, k)
        
        # Format results
        retrieved_docs = []
        for metadata, score in results:
            # Filter somewhat irrelevant results (L2 distance > 1.2 is usually quite far)
            if score < 1.2:
                retrieved_docs.append({
                    "content": metadata.get('text', ''),
                    "source": metadata.get('filename'),
                    "page": metadata.get('page'),
                    "timestamp": metadata.get('timestamp'),
                    "score": score
                })
            
        return retrieved_docs

retrieval_service = RetrievalService()
