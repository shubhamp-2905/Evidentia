import google.generativeai as genai
from app.config import settings
from app.services.retrieval import retrieval_service

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

class GenerationService:
    def __init__(self):
        self.model = genai.GenerativeModel(settings.GENERATION_MODEL)

    async def generate_answer(self, query: str):
        # Retrieve context
        docs = retrieval_service.retrieve(query)
        
        if not docs:
            return {
                "answer": "I could not find any relevant information in the uploaded documents.",
                "citations": []
            }
        
        # Assemble Context
        context_str = ""
        citations = []
        
        for i, doc in enumerate(docs):
            ref_num = i + 1
            source_info = f"{doc['source']}"
            if doc.get('page'):
                source_info += f", page {doc['page']}"
            if doc.get('timestamp'):
                source_info += f", {doc['timestamp']}"
            
            context_str += f"Source [{ref_num}]: {doc['content']}\nReference: {source_info}\n\n"
            
            citations.append({
                "source_file": doc['source'],
                "page": doc.get('page'),
                "timestamp": doc.get('timestamp'),
                "snippet": doc['content'][:100] + "...",
                "score": doc['score']
            })
            
        # Construct Prompt
        prompt = f"""
You are an intelligent assistant for a RAG system. Answer the user's question based ONLY on the provided context.
If the answer is not in the context, say "I cannot answer this based on the provided documents."
Cite your sources using square brackets like [1], [2] at the end of sentences where facts are used.
Do not hallucinate.

Context:
{context_str}

User Question: {query}
Answer:
"""
        
        # Generate
        try:
            response = self.model.generate_content(prompt)
            answer = response.text
        except Exception as e:
            if "429" in str(e) or "ResourceExhausted" in str(e):
                 answer = "I apologize, but I have hit the usage limit for the Gemini API (Quota Exceeded). Please try again in a minute."
            else:
                 answer = f"I encountered an error while generating the answer: {str(e)}"
        
        return {
            "answer": answer,
            "citations": citations
        }

generation_service = GenerationService()
