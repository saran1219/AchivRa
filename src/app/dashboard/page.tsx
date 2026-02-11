'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/adminService';
import { Navbar, Sidebar, PageLayout } from '@/components/Layout';
import { StatCard } from '@/components/ModernCard';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    // Redirect students to their achievements page
    if (!loading && user && user.role === 'student') {
      router.push('/student/achievements');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await adminService.getDashboardStats();
      setStats(data);
      setStatsLoading(false);
    };
    fetchStats();
  }, []);

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Sidebar>
        <PageLayout title="Dashboard" subtitle="Overview of your system metrics">
          {statsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading statistics...</p>
            </div>
          ) : (
            <>
              {/* Horizontal Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Total Achievements"
                  value={stats?.totalAchievements || 0}
                  icon="📊"
                  color="violet"
                />
                <StatCard
                  label="Approved"
                  value={stats?.approvedAchievements || 0}
                  icon="✅"
                  color="green"
                />
                <StatCard
                  label="Pending"
                  value={stats?.pendingAchievements || 0}
                  icon="⏳"
                  color="amber"
                />
                <StatCard
                  label="Rejected"
                  value={stats?.rejectedAchievements || 0}
                  icon="❌"
                  color="red"
                />
              </div>

              {/* User Stats Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <StatCard
                  label="Total Students"
                  value={stats?.totalStudents || 0}
                  icon="👥"
                  color="blue"
                />
                <StatCard
                  label="Total Faculty"
                  value={stats?.totalFaculty || 0}
                  icon="👨‍🏫"
                  color="violet"
                />
                <StatCard
                  label="Departments"
                  value="3"
                  icon="🏢"
                  color="amber"
                />
              </div>

              {/* Welcome Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-[#001a4d]/10">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">👋</div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#001a4d]">Welcome, {user.name}!</h2>
                    <p className="text-gray-600 text-sm mt-1">
                      You are logged in as <strong>{user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}</strong> • Department: <strong className="text-[#001a4d] font-bold">{user.department || 'Not assigned'}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </PageLayout>
      </Sidebar>
    </>
  );
}
