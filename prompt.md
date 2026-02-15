# 📘 PROJECT TITLE
Online Multimodal Retrieval-Augmented Generation (RAG) System for Unified Semantic Search

---

# 🎯 PROJECT GOAL
Build a fully functional multimodal Retrieval-Augmented Generation (RAG) system that ingests, indexes, and queries heterogeneous data sources including:

- Text-based PDFs and DOCX files
- Scanned PDFs (OCR required)
- Images (document images, screenshots, scanned pages)
- Audio recordings (via speech-to-text)

The system must support natural language queries and return grounded answers generated using the **Gemini API**, with clear citations pointing back to the original source documents, pages, image files, or audio timestamps.

Internet access is allowed during runtime **only for Gemini API generation**.  
All retrieval, embedding, indexing, and preprocessing must remain local and open-source.

---

# 🚧 HARD CONSTRAINTS (NON-NEGOTIABLE)

- Gemini API is used ONLY for final answer generation
- All document processing, embeddings, OCR, transcription, and indexing run locally
- Use ONLY open-source tools (except Gemini API)
- Zero budget (free tiers only)
- Pretrained models only (no fine-tuning)
- Hardware Target:
  - RTX 4060 (8GB VRAM)
  - 16GB RAM
- Programming Language: **Python 3.11 or Python 3.12 ONLY**
- Entire project must run inside a **Python virtual environment (venv)**
- Backend Framework: **FastAPI**
- Vector Database: **FAISS**
- Project folder structure MUST be:

project_root/
├── backend/
└── frontend/


- Designed as a single-laptop demo but scalable for institutional databases

---

# 🧠 CORE FUNCTIONAL REQUIREMENTS

## 1️⃣ DATA INGESTION
System must ingest:

- Text PDFs & DOCX (paragraph extraction)
- Scanned PDFs (OCR required)
- Images (PNG/JPG documents/screenshots)
- Audio (WAV/MP3)

### During ingestion:
- Extract text
- Perform OCR
- Transcribe audio offline
- Chunk text semantically
- Generate embeddings
- Store in unified FAISS index
- Save metadata for citation & provenance

---

## 2️⃣ MODALITY HANDLING STRATEGY

**Primary Retrieval Modality → Text**

- Images indexed as:
  - OCR extracted text (primary)
  - Optional image embeddings

- Audio handled as:
  - Offline transcription
  - Transcript chunks indexed as text with timestamps

Raw audio embeddings are NOT required.

---

## 3️⃣ QUERY TYPES

- Natural language queries (mandatory)
- Optional image query support
- Query types:
  - Short factual answers
  - Long summaries
  - Cross-document reasoning
  - Evidence-backed explanations

---

## 4️⃣ ANSWER GENERATION

- Generation via **Gemini API**
- Responses MUST be grounded ONLY in retrieved context
- No hallucinated facts
- Structured citations required

---

# 🤖 MODEL STACK (LOCKED)

### TEXT EMBEDDINGS
`sentence-transformers/all-MiniLM-L6-v2`

### IMAGE EMBEDDINGS
`CLIP ViT-B/32`

### OCR
`Tesseract OCR (offline)`

### AUDIO TRANSCRIPTION
`Whisper (small or medium, offline)`

### GENERATION MODEL
`Google Gemini API`

### VECTOR DATABASE
`FAISS`

---

# 🧩 EMBEDDING & INDEXING RULES

All embeddings stored in ONE FAISS index.

Each entry MUST include metadata:

```json
{
  "id": "uuid",
  "modality": "text | image | audio",
  "source_file": "filename.pdf",
  "page": 5,
  "chunk_id": 2,
  "timestamp": "00:12:30-00:13:10",
  "content_type": "paragraph | ocr | transcript"
}
🔎 RETRIEVAL PIPELINE
Convert query → embedding

FAISS similarity search

Retrieve Top-K chunks

Optional reranking

Assemble context

Send context → Gemini API

Preserve metadata for citations

📚 CITATION RULES (CRITICAL)
Single document → one citation allowed

Multiple documents → cite per fact

Must include:

Filename

Page OR timestamp OR image reference

Never fabricate citations

If insufficient evidence → explicitly say so

Example Output
According to the 2024 annual report, international collaborations increased [1].
Meeting transcripts confirm follow-up discussions in March [2].

[1] annual_report_2024.pdf — page 12
[2] meeting_audio_march.wav — 00:14:22–00:15:01
🏗 SYSTEM ARCHITECTURE
Backend (FastAPI)
Endpoints:

/upload

/query

/documents

Responsibilities:

Ingestion pipelines

Embedding

FAISS indexing

Retrieval

Context assembly

Gemini API interaction

Frontend (Separate Folder)
Simple web interface:

File upload

Chat query interface

Citation display

⚙️ IMPLEMENTATION RULES
Python 3.11/3.12 in venv ONLY

No fine-tuning

No cloud storage dependencies

Focus on grounding & explainability

Clean modular architecture

Scalable design

📦 DELIVERABLE EXPECTATION
A clean working codebase that:

Runs locally

Demonstrates multimodal ingestion

Produces grounded answers with citations

Uses Gemini API for generation

Suitable for academic evaluation & demo

🧾 FINAL NOTE
This is an engineering-first applied AI system, not an ML research benchmark.
Prioritize reliability, transparency, and correctness over novelty.

Proceed to design and implement the complete system accordingly.