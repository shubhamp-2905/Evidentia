import whisper
from pathlib import Path
from app.config import settings
from app.utils.chunking import chunk_text
from app.services.embeddings import embeddings_service
from app.services.vector_store import VectorStore
from app.utils.metadata import create_metadata, generate_document_id

class AudioProcessor:
    def __init__(self):
        self.model = None

    def load_model(self):
        if not self.model:
            # Load model only when needed to save startup time/memory
            self.model = whisper.load_model("small")

    async def process_audio(self, file_path: Path, filename: str):
        self.load_model()
        
        # Transcribe
        result = self.model.transcribe(str(file_path))
        full_text = result["text"]
        segments = result["segments"]
        
        doc_id = generate_document_id()
        
        # We can index segments directly or chunk the full text.
        # Prompt says: "Transcript chunks indexed as text with timestamps"
        # Segments have timestamps. Let's use segments but maybe combine small ones?
        # For simplicity, let's use the segments provided by Whisper as chunks if they are reasonable length,
        # or chunk the full text and map back to timestamps (harder).
        # Better: Index segments.
        
        texts = []
        metas = []
        
        for i, segment in enumerate(segments):
            text = segment["text"].strip()
            if not text:
                continue
                
            start = segment["start"]
            end = segment["end"]
            timestamp = f"{int(start//60):02d}:{int(start%60):02d}-{int(end//60):02d}:{int(end%60):02d}"
            
            texts.append(text)
            
            meta = create_metadata(
                doc_id=str(doc_id),
                filename=filename,
                content_type="transcript",
                timestamp=timestamp,
                chunk_id=i
            )
            meta['text'] = text
            metas.append(meta)
            
        if texts:
            embeddings = embeddings_service.encode_text(texts)
            VectorStore.add_texts(embeddings, metas)
            
        return doc_id

audio_processor = AudioProcessor()
