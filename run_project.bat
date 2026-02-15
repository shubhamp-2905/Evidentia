@echo off
echo Starting Multimodal RAG System...
cd backend
if not exist venv (
    echo Virtual environment not found! Please run setup first.
    pause
    exit
)
echo Activating virtual environment...
call venv\Scripts\activate

echo Starting Server...
echo Open http://127.0.0.1:8000 in your browser.
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

pause
