'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Settings {
  aiModel: string;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const t = useTranslations('settings');
  const [settings, setSettings] = useState<Settings>({
    aiModel: 'openai',
  });

  useEffect(() => {
    // Load settings from localStorage when component mounts
    const savedSettings = localStorage.getItem('chatSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          aiModel: parsedSettings.aiModel || 'openai',
        });
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    // Save settings to localStorage
    localStorage.setItem('chatSettings', JSON.stringify(settings));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-purple-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-purple-100">
            {t('title')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* AI Model Selection */}
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              {t('aiModel')}
            </label>
            <select
              value={settings.aiModel}
              onChange={(e) => setSettings({ aiModel: e.target.value })}
              className="w-full p-2 border border-purple-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-purple-100"
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
              <option value="python">Python</option>
            </select>
          </div>
        </div>
        
        <div className="p-4 border-t border-purple-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}