import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const toastConfig = {
  success: {
    bg: 'bg-green-500/80',
    icon: '✅',
  },
  error: {
    bg: 'bg-red-500/80',
    icon: '❌',
  },
  info: {
    bg: 'bg-blue-500/80',
    icon: 'ℹ️',
  },
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = toastConfig[type];

  return (
    <div className={`fixed top-5 right-5 z-50 ${config.bg} backdrop-blur-sm text-white py-3 px-5 rounded-lg shadow-lg flex items-center animate-fade-in-down`}>
      <span className="mr-3 text-xl">{config.icon}</span>
      <span>{message}</span>
    </div>
  );
};