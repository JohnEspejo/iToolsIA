'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { LogIn } from 'lucide-react';

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('common');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Close the menu immediately
    setIsOpen(false);
    
    // Execute logout immediately
    try {
      await signOut({ callbackUrl: '/auth/login' });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to direct redirect
      window.location.href = '/auth/login';
    }
  };

  // If loading, show nothing
  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    );
  }

  // If not authenticated, show login button
  if (!session?.user) {
    return (
      <button
        onClick={() => signIn('google', { callbackUrl: '/chat' })}
        className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-2 bg-purple-100 dark:bg-gray-700 hover:bg-purple-200 dark:hover:bg-gray-600 transition-colors"
        aria-label={t('login')}
      >
        <LogIn size={20} className="text-purple-600 dark:text-purple-300" />
        <span className="hidden md:inline text-sm font-medium text-purple-600 dark:text-purple-300">
          {t('login')}
        </span>
      </button>
    );
  }

  // If authenticated, show user menu
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-1"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User profile'}
            className="w-8 h-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
            {session.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200">
          {session.user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-[100] border border-gray-200 dark:border-gray-700 bottom-full">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {session.user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}