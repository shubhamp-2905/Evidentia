import os
import sys
import subprocess
import time
import webbrowser

def main():
    print("========================================")
    print("   Multimodal RAG System - Launcher")
    print("========================================")

    # 1. Check for Virtual Environment
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_dir = os.path.join(base_dir, "backend", "venv")
    
    if not os.path.exists(venv_dir):
        print(f"[ERROR] Virtual environment not found at: {venv_dir}")
        print("Please check where you installed the project.")
        input("Press Enter to exit...")
        sys.exit(1)

    # 2. Locate Python executable in venv
    if sys.platform == "win32":
        python_exe = os.path.join(venv_dir, "Scripts", "python.exe")
    else:
        python_exe = os.path.join(venv_dir, "bin", "python")

    if not os.path.exists(python_exe):
        print(f"[ERROR] Python executable not found at: {python_exe}")
        input("Press Enter to exit...")
        sys.exit(1)

    # 3. Open Browser (Wait a bit for server to start)
    print("[INFO] Server starting...")
    print("[INFO] Application will be available at http://127.0.0.1:8000")
    
    # changing cwd to backend
    backend_dir = os.path.join(base_dir, "backend")
    os.chdir(backend_dir)
    
    cmd = [
        python_exe, "-m", "uvicorn", "app.main:app", 
        "--reload", "--host", "127.0.0.1", "--port", "8000"
    ]
    
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n[INFO] Server stopped.")

if __name__ == "__main__":
    main()
