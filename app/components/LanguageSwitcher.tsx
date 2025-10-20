'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Globe } from 'lucide-react';
import { useDropdown } from '../contexts/DropdownContext';

interface Language {
  code: string;
  name: string;
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { openDropdown, setOpenDropdown } = useDropdown();

  const isOpen = openDropdown === 'language';

  const languages: Language[] = [
    { code: 'es-ES', name: 'Español (España)' },
    { code: 'es-CO', name: 'Español (Colombia)' },
    { code: 'en-US', name: 'English (US)' },
  ];

  const toggleLanguageDropdown = () => {
    setOpenDropdown(isOpen ? null : 'language');
  };

  const handleLanguageChange = (languageCode: string) => {
    // Ensure we have a valid pathname
    const currentPath = pathname || '/';
    
    // Extract the path without the locale prefix
    let pathWithoutLocale = currentPath;
    
    // Remove the current locale prefix if it exists
    if (currentPath.startsWith(`/${locale}/`)) {
      pathWithoutLocale = currentPath.substring(`/${locale}`.length);
    } else if (currentPath === `/${locale}`) {
      pathWithoutLocale = '/';
    }
    
    // Construct the new path with the target locale
    let newPath;
    if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
      newPath = `/${languageCode}`;
    } else {
      newPath = `/${languageCode}${pathWithoutLocale}`;
    }
    
    router.push(newPath);
    setOpenDropdown(null);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleLanguageDropdown}
        className="p-2 rounded-md hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
        aria-label="Change language"
      >
        <Globe size={20} className="text-purple-600 dark:text-purple-300" />
        <span className="sr-only md:not-sr-only md:inline-block md:ml-1 text-gray-900 dark:text-purple-300">
          {languages.find(lang => lang.code === locale)?.name.split(' ')[0] || 'Language'}
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