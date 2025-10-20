'use client';

import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  const t = useTranslations('common');

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
    >
      {t('logout')}
    </button>
  );
}