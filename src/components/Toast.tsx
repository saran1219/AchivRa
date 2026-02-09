'use client';

import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/50',
    error: 'bg-gradient-to-r from-red-500 to-pink-600 shadow-red-500/50',
    info: 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-orange-500/50',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-600 shadow-yellow-500/50',
  }[type];

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }[type];

  if (!isVisible) return null;

  return (
    <div
      className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-in-right backdrop-blur-sm border border-white border-opacity-20 hover:shadow-xl transition-all duration-300`}
    >
      <span className="text-2xl font-bold animation-bounce">{icon}</span>
      <span className="font-semibold">{message}</span>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
  return (
    <div className="fixed top-6 right-6 space-y-3 z-50">
      {toasts.map((toast, index) => (
        <Toast key={index} {...toast} />
      ))}
    </div>
  );
};
