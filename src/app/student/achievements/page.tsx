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
          {/* Student Profile Section */}
          <div className="mb-8 bg-white border-l-4 border-yellow-400 p-6 rounded-xl shadow-md animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex items-start justify-between gap-6 relative z-10">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#001a4d] mb-6 flex items-center gap-2">
                  <span className="text-3xl">👤</span> My Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-lg text-[#001a4d] font-bold">{user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-lg text-[#001a4d] font-medium">{user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Department</p>
                    <p className="text-lg text-[#001a4d] font-bold">{user?.department || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role</p>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-[#001a4d] rounded-full text-sm font-bold capitalize border border-yellow-200">
                      {user?.role || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="hidden sm:flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#001a4d] to-[#0033a0] flex items-center justify-center text-4xl font-bold text-yellow-400 shadow-xl border-4 border-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student</p>
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
