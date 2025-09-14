'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ChatLayout from '@/app/components/chat/ChatLayout';
import { v4 as uuidv4 } from 'uuid';

export default function ChatPage() {
  const t = useTranslations('chat');
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    // Create a new conversation when the page loads
    const newId = uuidv4();
    setConversationId(newId);
    
    // Get the current locale from the URL
    const locale = window.location.pathname.split('/')[1];
    router.push(`/${locale}/chat/${newId}`);
  }, [router]);

  return (
    <ChatLayout conversationId={conversationId} />
  );
}