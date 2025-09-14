import { NextRequest, NextResponse } from 'next/server';
import { conversationStore } from '../../route';

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

// POST /api/conversations/[id]/update-title - Update conversation title based on message
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    const conversation = conversationStore.data.find(c => c.id === params.id);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Only update if title is still default
    if (conversation.title === 'Nueva conversación' || conversation.title === 'Conversación de ejemplo') {
      conversation.title = generateConversationTitle(message);
      conversation.updatedAt = new Date().toISOString();
      
      return NextResponse.json({ 
        success: true, 
        title: conversation.title 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Title already set' 
    });
  } catch (error) {
    console.error('Error updating conversation title:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation title' },
      { status: 500 }
    );
  }
}