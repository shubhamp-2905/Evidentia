# 🧠 Multimodal RAG System

A powerful **Retrieval-Augmented Generation (RAG)** system built with **FastAPI**, **Gemini API**, and **FAISS**. This application allows you to upload **Text (PDF, DOCX)**, **Images**, and **Audio**, and ask questions about them. It uses advanced semantic search to provide grounded answers with citations.

---

## ✨ Features

- **📚 Multimodal Ingestion**: Upload PDF, DOCX, Images (PNG/JPG), and Audio (WAV/MP3).
- **🔍 Semantic Search**: Uses `sentence-transformers` and `CLIP` for text and image embeddings.
- **🤖 Gemini Integration**: Uses Google's `gemini-flash-latest` for high-speed, intelligent answers.
- **📝 Automatic Transcription**: Converts audio to text using OpenAI's **Whisper** model.
- **🖼️ Image OCR**: Extracts text from images and scanned PDFs using **Tesseract**.
- **📍 Precise Citations**: Answers include references to specific files, pages, and timestamps.
- **💾 Local Vector Store**: Uses **FAISS** for fast, local similarity search (no external vector DB needed).
- **🎨 Modern UI**: Beautiful, dark-mode web interface with drag-and-drop upload and instant preview/download of sources.

---

## 🛠️ Prerequisites

- **Python 3.10+** installed.
- **Tesseract OCR** installed:
  - **Windows**: [Download Installer](https://github.com/UB-Mannheim/tesseract/wiki) (Add to PATH).
  - **Linux**: `sudo apt install tesseract-ocr`
  - **macOS**: `brew install tesseract`
- **Google Gemini API Key**: [Get it here](https://aistudio.google.com/app/apikey).

---

## 🚀 Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd <project-folder>
    ```

2.  **Set Up Virtual Environment**
    ```bash
    # Windows
    python -m venv backend/venv
    backend\venv\Scripts\activate

    # Linux/Mac
    python3 -m venv backend/venv
    source backend/venv/bin/activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r backend/requirements.txt
    ```

4.  **Configure Environment**
    Create a `.env` file in the `backend/` directory:
    ```ini
    GEMINI_API_KEY=your_actual_api_key_here
    LOG_LEVEL=INFO
    ```

---

## ▶️ Usage

### Quick Start (Recommended)
We have provided a unified runner script that handles everything for you.

1.  **Run the Application**:
    ```bash
    python run_app.py
    ```
    This script will check your environment, activate the virtual environment, and start the server.

2.  **Open in Browser**:
    Go to **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

### Manual Start
If you prefer running components manually:
```bash
cd backend
venv\Scripts\python -m uvicorn app.main:app --reload
```

---

## 🏗️ Project Structure

```
Rag Project/
├── backend/
│   ├── app/
│   │   ├── api/            # Endpoints (upload, query, documents)
│   │   ├── services/       # Core logic (PDF, OCR, Whisper, FAISS)
│   │   ├── utils/          # Helpers (chunking, metadata)
│   │   ├── config.py       # Configuration
│   │   └── main.py         # FastAPI Entry Point
│   ├── data/
│   │   ├── uploads/        # Stored files
│   │   └── faiss_index/    # Vector embeddings
│   ├── venv/               # Virtual Environment
│   └── requirements.txt    # Dependencies
├── frontend/
│   ├── index.html          # Main UI
│   ├── styles.css          # Styling
│   └── script.js           # Frontend Logic
├── run_app.py              # One-click runner script
└── README.md               # Documentation
```

---

## 🔧 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **"Tesseract Not Found"** | Install Tesseract and ensure it's in your System PATH. |
| **"Quota Exceeded / 429"** | The system now handles this gracefully. Wait 60 seconds and try again. |
| **"ModuleNotFoundError"** | Ensure you activated the `venv` before running. Use `run_app.py` to be safe. |
| **Slow Startup** | The first run downloads AI models (Whisper, BERT). This is normal. |

---

## 🔮 Future Roadmap

- [ ] Add support for video file processing.
- [ ] Implement user authentication.
- [ ] Add persistent database (SQLite/PostgreSQL) for metadata.
