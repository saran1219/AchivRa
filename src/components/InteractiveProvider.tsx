'use client';

import React, { useState, useCallback } from 'react';
import { Toast, ToastType } from './Toast';
import { Modal } from './Modal';

export interface UseInteractiveReturn {
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  showAlert: (title: string, message: string) => void;
  toasts: Array<{ message: string; type: ToastType }>;
  modal: {
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'alert' | 'success';
    onConfirm: () => void;
  };
}

export const InteractiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts] = useState<Array<{ message: string; type: ToastType }>>([]);
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm' as 'confirm' | 'alert',
    onConfirm: () => {},
  });

  const _showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setModal({ isOpen: true, title, message, type: 'confirm', onConfirm });
  }, []);

  const _showAlert = useCallback((title: string, message: string) => {
    setModal({ isOpen: true, title, message, type: 'alert', onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })) });
  }, []);

  return (
    <>
      <div className="fixed top-6 right-6 space-y-3 z-50">
        {toasts.map((toast, idx) => (
          <Toast key={idx} message={toast.message} type={toast.type} />
        ))}
      </div>

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={() => {
          modal.onConfirm();
          setModal(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))}
      />

      {children}
    </>
  );
};
