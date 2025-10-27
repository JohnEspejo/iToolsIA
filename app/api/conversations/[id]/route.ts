import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { conversationStore, saveConversations } from '../route';

// GET /api/conversations/[id] - Get a specific conversation
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = conversationStore.data.find((c) => c.id === params.id);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations/[id] - Update a conversation
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title } = await req.json();
    
    const conversationIndex = conversationStore.data.findIndex((c) => c.id === params.id);
    
    if (conversationIndex === -1) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    const updatedConversation = {
      ...conversationStore.data[conversationIndex],
      title,
      updatedAt: new Date().toISOString(),
    };
    
    conversationStore.data[conversationIndex] = updatedConversation;
    
    // Save to file
    await saveConversations(conversationStore.data);
    
    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Delete a conversation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Reload conversations from file to ensure we have the latest data
    const filePath = join(process.cwd(), 'conversations.json');
    let conversations: any[] = [];
    
    try {
      const fileData = await readFile(filePath, 'utf8');
      conversations = JSON.parse(fileData);
    } catch (error) {
      console.error('Error reading conversations file:', error);
      // If we can't read the file, use the in-memory store
      conversations = conversationStore.data;
    }
    
    const conversationIndex = conversations.findIndex((c) => c.id === params.id);
    
    if (conversationIndex === -1) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    conversations.splice(conversationIndex, 1);
    
    // Update both in-memory store and file
    conversationStore.data = conversations;
    
    // Save to file
    await saveConversations(conversations);
    
    // Note: In a real app, this would be handled by the database
    // For now, we'll just return success
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    );
  }
}