@echo off
cd /d "%~dp0"
echo Starting Python RAG service...
echo Service will be available at http://localhost:5001
python rag_service.py
pause