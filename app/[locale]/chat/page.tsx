'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import ChatLayout from '@/app/components/chat/ChatLayout';

export default function ChatPage() {
  const t = useTranslations('chat');
  const router = useRouter();
  const { status } = useSession();
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect unauthenticated users to the login page
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Create a new conversation when the page loads
    const createConversation = async () => {
      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: 'Nueva conversación' }),
        });
        
        if (response.ok) {
          const newConversation = await response.json();
          setConversationId(newConversation.id);
          
          // Get the current locale from the URL
          const locale = window.location.pathname.split('/')[1];
          router.push(`/${locale}/chat/${newConversation.id}`);
        } else {
          console.error('Failed to create conversation');
          // Fallback to the old method
          const newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          setConversationId(newId);
          const locale = window.location.pathname.split('/')[1];
          router.push(`/${locale}/chat/${newId}`);
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        // Fallback to the old method
        const newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setConversationId(newId);
        const locale = window.location.pathname.split('/')[1];
        router.push(`/${locale}/chat/${newId}`);
      }
    };

    createConversation();
  }, [router]);

  // Show loading state while checking authentication status
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, don't render the chat
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <ChatLayout conversationId={conversationId} />
  );
}