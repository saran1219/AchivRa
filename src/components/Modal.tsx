'use client';

import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'confirm' | 'alert' | 'success';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'confirm',
}) => {
  if (!isOpen) return null;

  const bgColor = {
    confirm: 'bg-gradient-to-br from-orange-50 to-amber-50',
    alert: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    success: 'bg-gradient-to-br from-emerald-50 to-teal-50',
  }[type];

  const borderColor = {
    confirm: 'border-orange-300',
    alert: 'border-yellow-300',
    success: 'border-emerald-300',
  }[type];

  const buttonColor = {
    confirm: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg hover:shadow-xl',
    alert: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-lg hover:shadow-xl',
  }[type];

  const icon = {
    confirm: '❓',
    alert: '⚠️',
    success: '✅',
  }[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className={`${bgColor} border-2 ${borderColor} rounded-2xl p-8 max-w-md w-full shadow-2xl animate-bounce-in`}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-4 animate-bounce">{icon}</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">{title}</h2>
        </div>
        <p className="text-gray-700 mb-8 text-center leading-relaxed">{message}</p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 ${buttonColor} text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
