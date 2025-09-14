'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';

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

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessage: string;
  sources: Source[];
}

export default function MessageList({ 
  messages, 
  isLoading, 
  streamingMessage, 
  sources 
}: MessageListProps) {
  const t = useTranslations('chat');
  const [showSources, setShowSources] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-purple-50/30 dark:to-black/30">
      {messages.map((message, index) => (
        <div 
          key={message.id} 
          data-testid={message.role === 'user' ? 'message-user' : 'message-assistant'}
          className={`flex animate-fadeIn ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`flex items-start space-x-2 max-w-3xl ${
            message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
          }`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shadow-lg ${
              message.role === 'user' 
                ? 'bg-gradient-to-br from-purple-500 to-violet-600 text-white' 
                : 'bg-gradient-to-br from-gray-700 to-black text-white'
            }`}>
              {message.role === 'user' ? 'U' : 'AI'}
            </div>
            
            {/* Message bubble */}
            <div className={`relative group ${
              message.role === 'user' 
                ? 'bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-xl shadow-purple-500/25' 
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl shadow-black/10 dark:shadow-black/20'
            } p-3 rounded-xl max-w-xl relative overflow-hidden`}>
              {/* Message content */}
              <div className={`whitespace-pre-wrap leading-normal text-sm ${
                message.role === 'user' 
                  ? 'text-white' 
                  : 'text-gray-800 dark:text-purple-200'
              }`}>
                {message.content}
              </div>
              
              {/* Decorative elements */}
              {message.role === 'assistant' && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-full -mr-10 -mt-10 opacity-50"></div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Streaming message */}
      {isLoading && (
        <div data-testid="message-assistant" className="flex justify-start animate-fadeIn">
          <div className="flex items-start space-x-2 max-w-3xl">
            {/* AI Avatar */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-black text-white flex items-center justify-center text-xs font-semibold shadow-lg">
              AI
            </div>
            
            {/* Streaming message bubble */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl shadow-black/10 dark:shadow-black/20 p-3 rounded-xl max-w-xl relative overflow-hidden">
              <div className="whitespace-pre-wrap leading-normal text-sm text-gray-800 dark:text-purple-200">
                {streamingMessage || (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
              {streamingMessage && (
                <div className="inline-block w-2 h-5 bg-purple-500 ml-1 animate-pulse-slow"></div>
              )}
              
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-full -mr-10 -mt-10 opacity-50"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Sources section */}
      {sources.length > 0 && (
        <div className="flex justify-start animate-fadeIn">
          <div className="max-w-3xl w-full">
            <button
              data-testid="view-sources"
              onClick={() => setShowSources(!showSources)}
              className="group flex items-center space-x-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200 mb-3"
            >
              <ExternalLink size={16} className="group-hover:scale-110 transition-transform duration-200" />
              <span>{t('interface.viewSources')}</span>
              <div className={`transform transition-transform duration-200 ${
                showSources ? 'rotate-90' : ''
              }`}>
                ▶
              </div>
            </button>
            
            {showSources && (
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl p-4 shadow-xl shadow-black/10 dark:shadow-black/20 animate-fadeIn">
                <h3 className="font-semibold text-gray-800 dark:text-purple-200 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{sources.length} {sources.length === 1 ? 'Source' : 'Sources'}</span>
                </h3>
                <ul className="space-y-3">
                  {sources.map((source, index) => (
                    <li key={index} className="group">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-3 bg-white/40 dark:bg-gray-700/40 rounded-lg border border-white/30 dark:border-gray-600/30 hover:bg-white/60 dark:hover:bg-gray-700/60 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                      >
                        <h4 className="font-medium text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 mb-2 flex items-center space-x-2">
                          <span>{source.title}</span>
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-purple-300 leading-relaxed">
                          {source.snippet}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center max-w-md mx-auto animate-fadeIn">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-purple-200 mb-3">
              {t('interface.newConversation')}
            </h3>
            <p className="text-purple-500 dark:text-purple-400 leading-relaxed">
              {t('interface.placeholder')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}