'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-yellow-400"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null; // Don't render anything while redirecting
  }

  return <>{children}</>;
};
