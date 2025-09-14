'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Settings {
  temperature: number;
  topK: number;
  language: string;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const t = useTranslations('settings');
  const [settings, setSettings] = useState<Settings>({
    temperature: 0.7,
    topK: 5,
    language: 'es-ES',
  });

  useEffect(() => {
    // Load settings from localStorage when component mounts
    const savedSettings = localStorage.getItem('chatSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
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
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              {t('temperature')}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-purple-500 dark:text-purple-400">
              <span>{t('precise')}</span>
              <span>{settings.temperature.toFixed(1)}</span>
              <span>{t('creative')}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              {t('topK')}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={settings.topK}
              onChange={(e) => setSettings({ ...settings, topK: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-purple-500 dark:text-purple-400">
              <span>1</span>
              <span>{settings.topK}</span>
              <span>10</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
              {t('language')}
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full p-2 border border-purple-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-purple-100"
            >
              <option value="es-ES">Español (España)</option>
              <option value="es-CO">Español (Colombia)</option>
              <option value="en-US">English (US)</option>
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