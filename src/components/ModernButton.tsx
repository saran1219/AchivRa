import React from 'react';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-[#5F4A8B] text-white hover:shadow-lg hover:shadow-[#5F4A8B]/30',
    secondary: 'bg-gray-200 text-[#5F4A8B] hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:shadow-lg hover:shadow-red-500/30',
    success: 'bg-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/30',
    ghost: 'bg-transparent text-[#5F4A8B] border border-[#5F4A8B] hover:bg-[#5F4A8B]/10',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};
