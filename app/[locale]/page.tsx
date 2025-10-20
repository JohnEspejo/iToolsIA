'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function LocaleHome() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated') {
      // Redirect authenticated users to the chat page
      router.push('/chat');
    } else {
      // Redirect unauthenticated users to the login page
      router.push('/auth/login');
    }
  }, [status, router]);

  // Show loading state while checking authentication status
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}