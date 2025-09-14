'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import MessageList from './MessageList';

interface ChatAreaProps {
  conversationId: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface Source {
  title: string;
  url: string;
  snippet: string;
}

export default function ChatArea({ conversationId }: ChatAreaProps) {
  const t = useTranslations('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !conversationId) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');
    setSources([]);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationId,
          settings: {
            topK: 5,
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to read response');
      }

      let done = false;
      let completeMessage = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.substring(6));

                if (eventData.type === 'message') {
                  completeMessage += eventData.data.content;
                  setStreamingMessage(completeMessage);
                } else if (eventData.type === 'sources') {
                  setSources(eventData.data.sources);
                } else if (eventData.type === 'error') {
                  // Handle error from backend
                  completeMessage = eventData.data.message;
                  setStreamingMessage(completeMessage);
                } else if (eventData.type === 'complete') {
                  // Message is complete
                }
              } catch (e) {
                console.error('Error parsing SSE message:', e);
              }
            }
          }
        }
      }

      // Add the assistant message to the list
      const assistantMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: completeMessage,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
        streamingMessage={streamingMessage} 
        sources={sources}
      />
      
      <div className="border-t border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-6 shadow-2xl shadow-black/10 dark:shadow-black/20">
        <form onSubmit={handleSubmit} className="flex items-end gap-4 max-w-4xl mx-auto">
          <div className="flex-1 relative group">
            <textarea
              ref={inputRef}
              data-testid="chat-input"
              value={input}
              onChange={handleInputChange}
              placeholder={t('interface.placeholder')}
              className="w-full p-4 pr-12 border border-purple-200/50 dark:border-purple-600/50 rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-purple-100 placeholder-gray-900 dark:placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all duration-200 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 group-focus-within:shadow-xl group-focus-within:shadow-purple-500/10"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '200px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {/* Input decoration */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-violet-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          </div>
          
          <button
            type="submit"
            data-testid="send-button"
            disabled={!input.trim() || isLoading}
            className="p-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 disabled:shadow-none flex items-center justify-center min-w-[56px] h-14"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send size={20} className="transform group-hover:translate-x-0.5 transition-transform duration-200" />
            )}
            <span className="sr-only">{t('interface.send')}</span>
          </button>
        </form>
        
        {/* Input helper text */}
        <div className="flex justify-center mt-3">
          <p className="text-xs text-purple-400 dark:text-purple-500">
            Presiona <kbd className="px-2 py-1 bg-purple-100 dark:bg-gray-700 rounded text-purple-600 dark:text-purple-300 font-mono text-xs">Enter</kbd> para enviar, <kbd className="px-2 py-1 bg-purple-100 dark:bg-gray-700 rounded text-purple-600 dark:text-purple-300 font-mono text-xs">Shift + Enter</kbd> para nueva línea
          </p>
        </div>
      </div>
    </div>
  );
}