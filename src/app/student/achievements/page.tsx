'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import { Achievement, AchievementStatus } from '@/types';
import { AchievementList } from '@/components/AchievementComponents';
import { Navbar, Sidebar, PageLayout } from '@/components/Layout';

export default function StudentAchievementsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchAchievements = async () => {
        const data = await achievementService.getStudentAchievements(user.id);
        // Only show APPROVED achievements (added by faculty)
        const approvedOnly = data.filter(a => a.status === AchievementStatus.APPROVED);
        setAchievements(approvedOnly);
        setAchievementsLoading(false);
      };
      fetchAchievements();

      // Refresh achievements every 10 seconds to show real-time updates
      const interval = setInterval(fetchAchievements, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Sidebar>
        <PageLayout title="My Achievements">
          {/* Student Profile Section */}
          <div className="mb-8 bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-600 p-6 rounded-lg">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-orange-900 mb-4">👤 My Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-orange-700 mb-1">Full Name</p>
                    <p className="text-lg text-orange-900 font-medium">{user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-700 mb-1">Email</p>
                    <p className="text-lg text-orange-900 font-medium">{user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-700 mb-1">Department</p>
                    <p className="text-lg text-orange-900 font-medium">{user?.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-700 mb-1">Role</p>
                    <p className="text-lg text-orange-900 font-medium capitalize">{user?.role || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="text-center flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <p className="text-xs text-orange-600 font-semibold mt-1">Student</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {achievementsLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-600"></div>
                </div>
              ) : achievements.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow text-center">
                  <span className="text-6xl mb-4 block">📋</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Achievements Yet</h3>
                  <p className="text-gray-600 mb-4">Your department faculty hasn't added any achievements to your profile yet.</p>
                  <p className="text-sm text-gray-500">Ask your faculty members to add your achievements from the "Upload Achievement" section.</p>
                </div>
              ) : (
                <AchievementList achievements={achievements} showCertificate={true} />
              )}
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg shadow border border-orange-200">
              <h3 className="text-lg font-bold text-orange-900 mb-4">📊 Achievement Summary</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-orange-700 font-semibold">Total Achievements</p>
                  <p className="text-4xl font-bold text-orange-600">{achievements.length}</p>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg">
                  <p className="text-sm text-orange-700 font-semibold mb-1">✅ All Approved</p>
                  <p className="text-2xl font-bold text-orange-600">{achievements.length}</p>
                  <p className="text-xs text-orange-600 mt-1">All shown achievements are approved</p>
                </div>
              </div>
            </div>
          </div>
        </PageLayout>
      </Sidebar>
    </>
  );
}
