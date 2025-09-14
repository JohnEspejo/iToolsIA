'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ConversationSidebar from './ConversationSidebar';
import ChatArea from './ChatArea';
import ChatHeader from './ChatHeader';

interface ChatLayoutProps {
  conversationId: string | null;
}

export default function ChatLayout({ conversationId }: ChatLayoutProps) {
  const t = useTranslations('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/conversations');
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        } else {
          console.error('Failed to fetch conversations:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Function to refresh conversations (useful when a new conversation is created)
  const refreshConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100 dark:from-black dark:via-purple-900 dark:to-violet-900 overflow-hidden">
      <ConversationSidebar 
        isOpen={isSidebarOpen} 
        conversations={conversations}
        activeConversationId={conversationId}
        isLoading={isLoading}
        onRefresh={refreshConversations}
      />
      <div className="flex flex-col flex-1 h-full overflow-hidden backdrop-blur-sm">
        <ChatHeader 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent dark:via-black/30 pointer-events-none"></div>
          <ChatArea conversationId={conversationId} />
        </div>
      </div>
    </div>
  );
}