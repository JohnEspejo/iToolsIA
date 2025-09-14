import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Function to generate conversation title from message
function generateConversationTitle(message: string): string {
  if (!message) return 'Nueva conversación';
  
  // Clean the message and take first few words
  const cleanMessage = message.trim();
  const words = cleanMessage.split(' ').slice(0, 4); // Take first 4 words
  
  let title = words.join(' ');
  
  // Capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  // Add ellipsis if original message was longer
  if (cleanMessage.split(' ').length > 4) {
    title += '...';
  }
  
  // Ensure title is not too long
  if (title.length > 40) {
    title = title.substring(0, 37) + '...';
  }
  
  return title || 'Nueva conversación';
}

// Mock database for conversations
const conversationStore = {
  data: [
    {
      id: '1',
      title: 'Nueva conversación',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
};

export { conversationStore };

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
      id: uuidv4(),
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    conversationStore.data = [newConversation, ...conversationStore.data];
    
    return NextResponse.json(newConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

// Function to update conversation title
export function updateConversationTitle(conversationId: string, message: string) {
  const conversation = conversationStore.data.find(c => c.id === conversationId);
  if (conversation && (conversation.title === 'Nueva conversación' || conversation.title === 'Conversación de ejemplo')) {
    conversation.title = generateConversationTitle(message);
    conversation.updatedAt = new Date().toISOString();
  }
}