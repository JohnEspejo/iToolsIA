'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';

interface Language {
  code: string;
  name: string;
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const languages: Language[] = [
    { code: 'es-ES', name: 'Español (España)' },
    { code: 'es-CO', name: 'Español (Colombia)' },
    { code: 'en-US', name: 'English (US)' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    // Get the path without the locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    
    // Navigate to the same path but with the new locale
    router.push(`/${languageCode}${pathWithoutLocale}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
        aria-label="Change language"
      >
        <Globe size={20} className="text-purple-600 dark:text-purple-300" />
        <span className="sr-only md:not-sr-only md:inline-block md:ml-1 text-gray-900 dark:text-purple-300">
          {languages.find(lang => lang.code === locale)?.name.split(' ')[0]}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-purple-200 dark:border-gray-700">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`block w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-purple-100 hover:bg-purple-100 dark:hover:bg-gray-700 ${locale === language.code ? 'bg-purple-100 dark:bg-gray-700' : ''}`}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}