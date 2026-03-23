'use client';

import { VerificationDashboardComponent } from '@/components/VerificationDashboardComponent';
import { Navbar, Sidebar } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types';

export default function VerificationQueuePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    // Protect route - Only Verification Team
    if (!loading && user) {
      if (user.role !== "verification_team") {
        router.push('/');
      } else {
        console.log("Navigating to:", "/verification/queue");
      }
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
  if (user.role !== "verification_team") {
      return null;
  }

  return (
    <>
      <Navbar />
      <Sidebar>
        <VerificationDashboardComponent initialFilter="pending" />
      </Sidebar>
    </>
  );
}
