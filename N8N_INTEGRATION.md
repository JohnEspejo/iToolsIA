# Integration with n8n and Python RAG Service

This document explains how the chat application integrates with both n8n workflows and the Python RAG service.

## n8n Integration

The application connects to n8n webhooks for standard AI model interactions (OpenAI, Gemini).

### Configuration

The n8n integration is configured through environment variables:
- `N8N_BASE_URL`: The base URL of your n8n instance
- `N8N_WEBHOOK_PATH`: The webhook path for the default AI model

### Webhook URLs

- **Default Model**: Uses the webhook configured in `N8N_BASE_URL` + `N8N_WEBHOOK_PATH`
- **OpenAI Model**: https://sswebhookss.joaobr.site/webhook/a9ac359b-ae8a-4611-96b8-eb302ce6b0ca
- **Gemini Model**: https://sswebhookss.joaobr.site/webhook/fd3da80e-250d-4887-b822-0c3f0b149934

## Python RAG Service Integration

The Python RAG service provides document-based question answering capabilities.

### How it Works

1. Users upload PDF documents through the chat interface
2. The documents are processed by the Python RAG service to create embeddings
3. Users can then ask questions about the uploaded documents
4. The service retrieves relevant document sections and uses them to generate answers

### API Routes

The Python RAG service is accessed through the `/api/chat/python-rag` route in the Next.js application:

- **POST /api/chat/python-rag**: Send questions to the Python RAG service
- **PUT /api/chat/python-rag**: Upload documents to create new chatbots

### Environment Variables

- `PYTHON_RAG_BASE_URL`: The base URL of the Python RAG service (default: http://localhost:5001)

## Selecting AI Models

Users can select different AI models through the chat interface:
- **OpenAI**: Standard OpenAI GPT models
- **Gemini**: Google's Gemini models
- **Python RAG**: Document-based question answering using the Python RAG service

The selection is sent as the `aiModel` parameter in the chat requests.