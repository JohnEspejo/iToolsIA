'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Menu, Settings, X } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import { useDropdown } from '../../contexts/DropdownContext';

interface ChatHeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function ChatHeader({ toggleSidebar, isSidebarOpen }: ChatHeaderProps) {
  const t = useTranslations('chat');
  const { openDropdown, setOpenDropdown } = useDropdown();
  const [selectedModel, setSelectedModel] = useState('openai');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSettingsOpen = openDropdown === 'settings';

  // Load saved AI model from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('chatSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSelectedModel(parsedSettings.aiModel || 'openai');
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setOpenDropdown]);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    // Save to localStorage
    const savedSettings = localStorage.getItem('chatSettings');
    let settings = { aiModel: model };
    if (savedSettings) {
      try {
        settings = { ...JSON.parse(savedSettings), aiModel: model };
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    localStorage.setItem('chatSettings', JSON.stringify(settings));
    setOpenDropdown(null);
  };

  const toggleSettings = () => {
    setOpenDropdown(isSettingsOpen ? null : 'settings');
  };

  return (
    <header className="h-16 border-b border-white/20 dark:border-gray-700/50 bg-white/80 dark:bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 shadow-lg shadow-black/5 dark:shadow-black/20 z-10 relative">
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
          {/* Settings dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleSettings}
              className="p-2 rounded-lg hover:bg-purple-200/50 dark:hover:bg-gray-600/50 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Settings"
            >
              <Settings size={18} className="text-purple-600 dark:text-purple-300" />
            </button>
            
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-[100] border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    {t('settings.title')}
                  </h3>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => handleModelChange('openai')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedModel === 'openai'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    OpenAI
                  </button>
                  <button
                    onClick={() => handleModelChange('gemini')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedModel === 'gemini'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Gemini
                  </button>
                  <button
                    onClick={() => handleModelChange('python')}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      selectedModel === 'python'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Python
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}