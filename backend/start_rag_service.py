import subprocess
import sys
import os

def start_rag_service():
    """Start the Python RAG service"""
    try:
        # Change to the backend directory
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(backend_dir)
        
        # Start the RAG service
        print("Starting Python RAG service...")
        print("Service will be available at http://localhost:5001")
        subprocess.run([sys.executable, "rag_service.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error starting RAG service: {e}")
    except KeyboardInterrupt:
        print("\nRAG service stopped.")

if __name__ == "__main__":
    start_rag_service()