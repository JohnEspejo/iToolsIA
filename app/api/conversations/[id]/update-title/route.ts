import { NextRequest, NextResponse } from 'next/server';
import { conversationStore, updateConversationTitle } from '@/lib/conversations';

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
    
    const conversation = conversationStore.data.find((c: any) => c.id === params.id);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Only update if title is still default
    if (conversation.title === 'Nueva conversación' || conversation.title === 'Conversación de ejemplo') {
      // Use the shared updateConversationTitle function which handles persistence
      await updateConversationTitle(params.id, message);
      
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