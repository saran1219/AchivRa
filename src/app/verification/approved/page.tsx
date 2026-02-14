'use client';

import { VerificationDashboardComponent } from '@/components/VerificationDashboardComponent';
import { Navbar, Sidebar } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types';

export default function VerificationApprovedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    // Protect route - Only Verification Team
    if (!loading && user && user.role !== UserRole.VERIFICATION_TEAM && user.role !== UserRole.ADMIN) {
      router.push('/unauthorized');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001a4d]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-yellow-400"></div>
      </div>
    );
  }

  // Double check render protection
  if (user.role !== UserRole.VERIFICATION_TEAM && user.role !== UserRole.ADMIN) {
      return null;
  }

  return (
    <>
      <Navbar />
      <Sidebar>
        <VerificationDashboardComponent initialFilter="approved" />
      </Sidebar>
    </>
  );
}
