import { NextRequest, NextResponse } from 'next/server';
import { conversationStore, saveConversations } from '@/lib/conversations';

// GET /api/conversations - Get all conversations
export async function GET() {
  try {
    return NextResponse.json(conversationStore.data);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const { title = 'Nueva conversación' } = await req.json().catch(() => ({}));
    
    const newConversation = {
      id: Math.random().toString(36).substring(7),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    
    conversationStore.data = [newConversation, ...conversationStore.data];
    
    // Save to file
    await saveConversations(conversationStore.data);
    
    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
