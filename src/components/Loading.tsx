'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4 animate-fade-in">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-orange-600 border-r-amber-600 rounded-full animate-spin`}
        />
        <div
          className={`${sizeClasses[size]} border-4 border-transparent border-b-orange-500 rounded-full animate-spin absolute inset-0 animation-reverse`}
        />
      </div>
      {text && <p className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-semibold animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export const SkeletonLoader: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="space-y-4 p-4 animate-fade-in">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-shimmer" />
      ))}
    </div>
  );
};
