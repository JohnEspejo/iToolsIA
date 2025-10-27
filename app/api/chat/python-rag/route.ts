import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export const runtime = 'nodejs';

// Function to call the Python RAG service
async function callPythonRAGService(endpoint: string, data: any) {
  const pythonRagBaseUrl = process.env.PYTHON_RAG_BASE_URL || 'http://localhost:5001';
  const url = `${pythonRagBaseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Python RAG service responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Python RAG service:', error);
    throw error;
  }
}

// Function to call the Python RAG service with file upload
async function callPythonRAGServiceWithFile(endpoint: string, formData: FormData) {
  const pythonRagBaseUrl = process.env.PYTHON_RAG_BASE_URL || 'http://localhost:5001';
  const url = `${pythonRagBaseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Python RAG service responded with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling Python RAG service:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, chatbotId, action } = await req.json();

    // Determine which action to perform
    if (action === 'build_chatbot') {
      // This would be called when uploading a file to create a new chatbot
      // For now, we'll return a placeholder response
      return NextResponse.json(
        { 
          chatbot_id: 'new_chatbot_id',
          status: 'Chatbot creation started'
        },
        { status: 201 }
      );
    } else if (action === 'ask_chatbot' && chatbotId) {
      // Ask a question to an existing chatbot
      try {
        const data = { question: message };
        const result = await callPythonRAGService(`/ask_chatbot/${chatbotId}`, data);
        
        // Return the answer from the Python RAG service
        return NextResponse.json({
          message: result.answer,
          sources: [] // Add sources if available from the Python service
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: `Failed to get response from Python RAG service: ${error.message}` },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing chatbotId for ask_chatbot action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing Python RAG request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Handle file upload for building a new chatbot
export async function PUT(req: NextRequest) {
  try {
    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Create a new FormData to send to Python service
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);
    
    // Call the Python RAG service to build a new chatbot
    try {
      const result = await callPythonRAGServiceWithFile('/build_chatbot', pythonFormData);
      
      // Return the chatbot ID from the Python RAG service
      return NextResponse.json({
        chatbot_id: result.chatbot_id,
        status: 'Chatbot created successfully'
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to create chatbot with Python RAG service: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing file upload for Python RAG:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}