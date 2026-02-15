import os
import io
import fitz # PyMuPDF, usually faster/better than pdfplumber for some things but prompt asked for pdfplumber? 
# Prompt: "Implement PDF text extraction (PyPDF2/pdfplumber)"
# I'll use pdfplumber as requested.
import pdfplumber
import docx
import pytesseract
from PIL import Image
from fastapi import UploadFile
from pathlib import Path

from app.config import settings
from app.services.embeddings import embeddings_service
from app.services.vector_store import VectorStore
from app.utils.chunking import chunk_text
from app.utils.metadata import create_metadata, generate_document_id

class DocumentProcessor:
    
    async def process_file(self, file: UploadFile, file_path: Path):
        content_type = file.content_type
        filename = file.filename
        doc_id = generate_document_id()
        
        text_chunks = []
        
        if content_type == "application/pdf":
            text_chunks = self._process_pdf(file_path)
        elif content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            text_chunks = self._process_docx(file_path)
        elif content_type.startswith("image/"):
            text_chunks = self._process_image(file_path)
        # Audio handled separate
            
        # Embed and Store
        if text_chunks:
            # Generate Embeddings
            texts = [chunk['text'] for chunk in text_chunks]
            embeddings = embeddings_service.encode_text(texts)
            
            # Prepare Metadata
            metas = []
            for i, chunk in enumerate(text_chunks):
                meta = create_metadata(
                    doc_id=str(doc_id),
                    filename=filename,
                    content_type="text", # or ocr
                    page=chunk.get('page'),
                    chunk_id=i
                )
                meta['text'] = chunk['text'] # Store text in metadata for retrieval context
                metas.append(meta)
                
            VectorStore.add_texts(embeddings, metas)
            
        return doc_id

    def _process_pdf(self, file_path: Path):
        chunks = []
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if not text:
                    # Run OCR if no text found using pytesseract on page image
                    # Convert page to image
                    im = page.to_image(resolution=300)
                    text = pytesseract.image_to_string(im.original)
                
                if text:
                    page_chunks = chunk_text(text)
                    for chunk in page_chunks:
                        chunks.append({"text": chunk, "page": i + 1})
        return chunks

    def _process_docx(self, file_path: Path):
        chunks = []
        doc = docx.Document(file_path)
        full_text = "\n".join([para.text for para in doc.paragraphs])
        text_chunks = chunk_text(full_text)
        for chunk in text_chunks:
             chunks.append({"text": chunk, "page": 1}) # DOCX doesn't have pages in same way
        return chunks

    def _process_image(self, file_path: Path):
        # OCR
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        chunks = []
        if text:
            text_chunks = chunk_text(text)
            for chunk in text_chunks:
                chunks.append({"text": chunk, "page": 1})
        
        # TODO: Also could embed image directly using CLIP if we want image retrieval
        # Prompt says: "Images indexed as: OCR extracted text (primary), Optional image embeddings"
        # Since I'm using text-based RAG mainly, OCR is key. 
        # But if we want image match? 
        # For now, OCR is sufficient for "Unified Semantic Search" via text query.
        return chunks

document_processor = DocumentProcessor()
