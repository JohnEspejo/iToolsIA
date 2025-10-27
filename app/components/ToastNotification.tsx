'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'info' | 'success' | 'warning';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'warning':
        return 'bg-yellow-600';
      default:
        return 'bg-purple-600';
    }
  };

  return (
    <div className={`fixed top-4 right-4 ${getTypeStyles()} text-white px-4 py-3 rounded-lg shadow-lg z-[9999] flex items-center animate-fadeIn`}>
      <span className="mr-2">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">
        <X size={16} />
      </button>
    </div>
  );
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState<Array<{id: number, message: string, type: 'info' | 'success' | 'warning'}>>([]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    console.log('Showing toast:', message, type);
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const hideToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Make showToast available globally
  useEffect(() => {
    console.log('ToastNotification mounted');
    (window as any).showToast = showToast;
    
    // Also make it available on the global object
    if (typeof window !== 'undefined') {
      (window as any).appToast = showToast;
    }
    
    return () => {
      console.log('ToastNotification unmounted');
      delete (window as any).showToast;
      delete (window as any).appToast;
    };
  }, []);

  // Also expose the function directly on first render
  if (typeof window !== 'undefined') {
    (window as any).showToast = showToast;
  }

  return (
    <div>
      {toasts.map(({ id, message, type }) => (
        <Toast key={id} message={message} type={type} onClose={() => hideToast(id)} />
      ))}
    </div>
  );
}