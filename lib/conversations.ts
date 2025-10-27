import { writeFile, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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

// Define the Conversation type
interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

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

// Function to get the conversations file path
function getConversationsFilePath() {
  return join(process.cwd(), 'conversations.json');
}

// Function to load conversations from file
async function loadConversations(): Promise<Conversation[]> {
  try {
    const filePath = getConversationsFilePath();
    await stat(filePath); // Check if file exists
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or there's an error, return default data
    return [
      {
        id: '1',
        title: 'Nueva conversación',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}

// Function to save conversations to file
async function saveConversations(conversations: Conversation[]) {
  try {
    const filePath = getConversationsFilePath();
    await writeFile(filePath, JSON.stringify(conversations, null, 2));
  } catch (error) {
    console.error('Error saving conversations:', error);
  }
}

// Initialize conversation store with data from file
let conversationStore = {
  data: [] as Conversation[],
};

// Load conversations when the module is imported
loadConversations().then(data => {
  conversationStore.data = data;
});

// Function to update conversation title
async function updateConversationTitle(conversationId: string, message: string) {
  const conversation = conversationStore.data.find(c => c.id === conversationId);
  if (conversation && (conversation.title === 'Nueva conversación' || conversation.title === 'Conversación de ejemplo')) {
    conversation.title = generateConversationTitle(message);
    conversation.updatedAt = new Date().toISOString();
    
    // Save to file
    await saveConversations(conversationStore.data);
  }
}

// Function to add a message to a conversation
async function addMessageToConversation(conversationId: string, message: Message) {
  const conversation = conversationStore.data.find(c => c.id === conversationId);
  if (conversation) {
    if (!conversation.messages) {
      conversation.messages = [];
    }
    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();
    
    // Save to file
    await saveConversations(conversationStore.data);
  }
}

export { conversationStore, saveConversations, updateConversationTitle, addMessageToConversation, loadConversations };