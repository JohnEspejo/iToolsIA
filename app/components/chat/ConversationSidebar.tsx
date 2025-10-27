'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PlusCircle, Search, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import UserMenu from '../UserMenu';

interface ConversationSidebarProps {
  isOpen: boolean;
  conversations: any[];
  activeConversationId: string | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function ConversationSidebar({ 
  isOpen, 
  conversations, 
  activeConversationId,
  isLoading = false,
  onRefresh
}: ConversationSidebarProps) {
  const t = useTranslations('chat');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const handleNewConversation = async () => {
    try {
      // Create a new conversation via API
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Nueva conversación' }),
      });
      
      if (response.ok) {
        const newConversation = await response.json();
        // Refresh the conversations list
        if (onRefresh) {
          onRefresh();
        }
        // Navigate to the new conversation
        const locale = window.location.pathname.split('/')[1];
        router.push(`/${locale}/chat/${newConversation.id}`);
      } else {
        console.error('Failed to create conversation');
        // Fallback to the old method
        const newId = uuidv4();
        const locale = window.location.pathname.split('/')[1];
        router.push(`/${locale}/chat/${newId}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Fallback to the old method
      const newId = uuidv4();
      const locale = window.location.pathname.split('/')[1];
      router.push(`/${locale}/chat/${newId}`);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Show success notification
        const showToast = (window as any).showToast || (window as any).appToast;
        if (typeof showToast === 'function') {
          showToast('Conversación eliminada correctamente', 'success');
        }
        
        // If we're deleting the active conversation, navigate to the main chat page
        if (conversationId === activeConversationId) {
          const locale = window.location.pathname.split('/')[1];
          router.push(`/${locale}/chat`);
        }
        
        // Refresh the conversations list
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        console.error('Failed to delete conversation');
        // Show error notification
        const showToast = (window as any).showToast || (window as any).appToast;
        if (typeof showToast === 'function') {
          showToast('Error al eliminar la conversación', 'warning');
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      // Show error notification
      const showToast = (window as any).showToast || (window as any).appToast;
      if (typeof showToast === 'function') {
        showToast('Error al eliminar la conversación', 'warning');
      }
    } finally {
      setConversationToDelete(null);
    }
  };

  const confirmDelete = (conversationId: string) => {
    setConversationToDelete(conversationId);
  };

  const cancelDelete = () => {
    setConversationToDelete(null);
  };

  if (!isOpen) return null;

  return (
    <div className="w-72 h-full bg-white/90 dark:bg-black/90 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50 flex flex-col shadow-2xl shadow-black/10 dark:shadow-black/30">
      <div className="p-6">
        <button
          data-testid="new-conversation"
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-gray-900 dark:text-purple-100 py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 font-medium"
        >
          <PlusCircle size={20} />
          {t('interface.newConversation')}
        </button>
      </div>
      
      <div className="px-6 pb-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 dark:text-purple-300 group-focus-within:text-purple-900 dark:group-focus-within:text-purple-200 transition-all duration-300 drop-shadow-lg group-focus-within:scale-125 group-focus-within:drop-shadow-xl" size={20} />
          <input
            data-testid="sidebar-search"
            type="text"
            placeholder={t('sidebar.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-purple-200/50 dark:border-purple-600/50 rounded-xl bg-purple-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-purple-100 placeholder-gray-600 dark:placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 backdrop-blur-sm"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <h2 className="px-3 py-2 text-xs font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wider mb-3">
          {t('sidebar.conversations')}
        </h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              <div className="w-8 h-8 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-200 to-purple-300 dark:from-violet-800 dark:to-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
              <Search className="text-gray-900 dark:text-purple-200 drop-shadow-xl" size={28} />
            </div>
            <p className="text-sm text-purple-500 dark:text-purple-400 leading-relaxed">
              {t('sidebar.noConversations')}
            </p>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation, index) => (
              <li key={conversation.id} className="animate-fadeIn" style={{ animationDelay: `${index * 50}ms` }}>
                {/* Delete confirmation dialog */}
                {conversationToDelete === conversation.id ? (
                  <div className="w-full bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg p-3 mb-2">
                    <p className="text-white text-xs font-medium mb-2">¿Deseas eliminar esta conversación?</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteConversation(conversation.id)}
                        className="flex-1 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded transition-colors"
                      >
                        Sí
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="flex-1 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded transition-colors"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const locale = window.location.pathname.split('/')[1];
                      router.push(`/${locale}/chat/${conversation.id}`);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 group relative overflow-hidden ${
                      conversation.id === activeConversationId 
                        ? 'bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 text-purple-700 dark:text-purple-300 shadow-lg shadow-purple-500/10 border border-purple-200/50 dark:border-purple-700/50' 
                        : 'hover:bg-purple-50/80 dark:hover:bg-gray-700/50 text-gray-700 dark:text-purple-300 hover:shadow-md hover:shadow-black/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                          conversation.id === activeConversationId
                            ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                            : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-gray-400 dark:group-hover:bg-gray-500'
                        }`}></div>
                        <span className="truncate font-medium">
                          {conversation.title || 'Untitled conversation'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(conversation.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-purple-200/50 dark:hover:bg-gray-600/50 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        aria-label="Eliminar conversación"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {conversation.id === activeConversationId && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-lg"></div>
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* User Menu at the bottom */}
      <div className="p-4 border-t border-white/20 dark:border-gray-700/50">
        <UserMenu />
      </div>
    </div>
  );
}