'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import ChatLayout from '@/app/components/chat/ChatLayout';

export default function ChatIdPage({ params }: { params: { id: string } }) {
  const t = useTranslations('chat');
  const { status } = useSession();
  const { id } = params;

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
    <ChatLayout conversationId={id} />
  );
}