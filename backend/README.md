# Python RAG Service

This directory contains the Python-based Retrieval-Augmented Generation (RAG) service for the iToolsIA project.

## Overview

The Python RAG service provides document-based question answering capabilities using:
- Flask for the web framework
- ChromaDB for vector storage and similarity search
- OpenAI GPT models for language generation
- PyPDF2 for PDF text extraction

## Setup

1. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file with your OpenAI API key:
   ```bash
   OPEN_AI_API_KEY=your_openai_api_key_here
   ```

3. Run the service:
   ```bash
   python rag_service.py
   ```

The service will start on `http://localhost:5001`.

## API Endpoints

### Build Chatbot
- **URL**: `/build_chatbot`
- **Method**: `POST`
- **Description**: Creates a new chatbot with embeddings from an uploaded PDF file
- **Form Data**: `file` (PDF file)
- **Response**: JSON with `chatbot_id`

### Ask Chatbot
- **URL**: `/ask_chatbot/<chatbot_id>`
- **Method**: `POST`
- **Description**: Ask a question to a specific chatbot
- **Body**: JSON with `question` field
- **Response**: JSON with `answer` field

### Chatbot Status
- **URL**: `/chatbot_status/<chatbot_id>`
- **Method**: `GET`
- **Description**: Get the status of a chatbot
- **Response**: JSON with chatbot status

### Health Check
- **URL**: `/health`
- **Method**: `GET`
- **Description**: Health check endpoint
- **Response**: JSON with service status

## Integration with Next.js Frontend

The service is integrated with the Next.js frontend through the `/api/chat/python-rag` route, which proxies requests to the Python service.