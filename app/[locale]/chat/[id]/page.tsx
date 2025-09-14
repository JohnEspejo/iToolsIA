'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import ChatLayout from '@/app/components/chat/ChatLayout';

export default function ChatIdPage({ params }: { params: { id: string } }) {
  const t = useTranslations('chat');
  const { id } = params;

  return (
    <ChatLayout conversationId={id} />
  );
}