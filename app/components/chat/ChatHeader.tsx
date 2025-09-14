'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, Settings, X } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import SettingsModal from './SettingsModal';

interface ChatHeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function ChatHeader({ toggleSidebar, isSidebarOpen }: ChatHeaderProps) {
  const t = useTranslations('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <header className="h-16 border-b border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 shadow-lg shadow-black/5 dark:shadow-black/20">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl hover:bg-purple-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-105 active:scale-95 border border-transparent hover:border-purple-200/50 dark:hover:border-gray-600/50"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? <X size={20} className="text-purple-600 dark:text-purple-300" /> : <Menu size={20} className="text-purple-600 dark:text-purple-300" />}
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-purple-600 dark:from-purple-200 dark:to-purple-400 bg-clip-text text-transparent">
            {process.env.NEXT_PUBLIC_APP_NAME || 'Chat App'}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 bg-purple-100/50 dark:bg-gray-700/50 rounded-xl p-1 border border-purple-200/50 dark:border-gray-600/50">
          <ThemeToggle />
          <LanguageSwitcher />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg hover:bg-purple-200/50 dark:hover:bg-gray-600/50 transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Settings"
          >
            <Settings size={18} className="text-purple-600 dark:text-purple-300" />
          </button>
        </div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </header>
  );
}