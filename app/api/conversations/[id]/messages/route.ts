import { NextRequest, NextResponse } from 'next/server';
import { conversationStore, addMessageToConversation } from '../../route';

// Define the Message type
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  file?: {
    name: string;
    type: string;
    url?: string;
  };
}

// POST /api/conversations/[id]/messages - Add a message to a conversation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageData = await req.json();
    
    // Validate required fields
    if (!messageData.content) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }
    
    // Find the conversation
    const conversation = conversationStore.data.find(c => c.id === params.id);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Create message object with proper structure
    const message: Message = {
      id: messageData.id || Date.now().toString(),
      role: messageData.role || 'user',
      content: messageData.content,
      createdAt: messageData.createdAt || new Date().toISOString(),
      ...(messageData.file && { file: messageData.file })
    };
    
    // Add message to conversation
    await addMessageToConversation(params.id, message);
    
    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Error adding message to conversation:', error);
    return NextResponse.json(
      { error: 'Failed to add message to conversation' },
      { status: 500 }
    );
  }
}

// GET /api/conversations/[id]/messages - Get all messages for a conversation
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Find the conversation
    const conversation = conversationStore.data.find(c => c.id === params.id);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Return messages (or empty array if none)
    return NextResponse.json(conversation.messages || []);
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation messages' },
      { status: 500 }
    );
  }
}