'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/adminService';
import { Navbar, Sidebar } from '@/components/Layout';
import { useRouter } from 'next/navigation';

export default function FacultyDashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAchievements: 0,
    approvedAchievements: 0,
    pendingAchievements: 0,
    rejectedAchievements: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.department) {
        try {
          console.log('Faculty Dashboard: Fetching stats for department:', user.department);
          const data = await adminService.getDepartmentStats(user.department);
          console.log('Faculty Dashboard: Received stats:', data);
          setStats(data);
        } catch (error) {
          console.error('Error loading stats:', error);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
      }
    };

    if (user?.department) {
      fetchStats();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar>
        <div className="flex flex-col h-full bg-gradient-to-br from-[#001a4d] to-[#0033a0] p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in pb-12">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Faculty Dashboard</h1>
              <p className="text-blue-200">Manage your department's student achievements</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                    {user.name ? user.name.charAt(0).toUpperCase() : '👨‍🏫'}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-[#001a4d] mb-1">
                      Welcome, {user.name}
                    </h2>
                    <div className="space-y-1 text-gray-600">
                      <p className="flex items-center justify-center md:justify-start gap-2">
                        <span>📧</span> {user.email}
                      </p>
                      <p className="flex items-center justify-center md:justify-start gap-2">
                        <span>🏢</span> Department: <span className="font-bold text-[#001a4d]">{user.department}</span>
                      </p>
                      <p className="flex items-center justify-center md:justify-start gap-2">
                        <span>🛡️</span> Role: <span className="uppercase tracking-wide text-sm font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Faculty</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Bottom Bar */}
              <div className="h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
            </div>

            {/* Performance Overview & Stats */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📊</span> {user.department} Performance Overview
              </h3>
              
              {loadingStats ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-white/10 backdrop-blur-sm rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Approval Rate */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 backdrop-blur-md border border-purple-400/30 rounded-xl p-6 text-white hover:bg-purple-500/30 transition-colors">
                    <div className="text-3xl font-bold mb-1 text-purple-200">{(stats as any).approvalRate}%</div>
                    <div className="text-purple-100 text-sm font-medium">Approval Rate</div>
                  </div>

                  {/* Pending Count */}
                  <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-400/30 rounded-xl p-6 text-white hover:bg-yellow-500/30 transition-colors">
                     <div className="text-3xl font-bold mb-1 text-yellow-300">{stats.pendingAchievements}</div>
                     <div className="text-yellow-100 text-sm font-medium">Pending Review</div>
                  </div>

                  {/* Total Achievements */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-white hover:bg-white/20 transition-colors">
                    <div className="text-3xl font-bold mb-1">{stats.totalAchievements}</div>
                    <div className="text-blue-200 text-sm font-medium">Total Achievements</div>
                  </div>

                  {/* Total Students */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-white hover:bg-white/20 transition-colors">
                    <div className="text-3xl font-bold mb-1">{stats.totalStudents}</div>
                    <div className="text-blue-200 text-sm font-medium">Total Students</div>
                  </div>
                </div>
              )}
            </div>

            {/* Department Insights Section */}
            {!loadingStats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Category Breakdown */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-[#001a4d] mb-4 flex items-center gap-2">
                    <span>📑</span> Category Breakdown
                  </h3>
                  <div className="space-y-4">
                    {Object.entries((stats as any).categoryBreakdown || {}).length > 0 ? (
                      Object.entries((stats as any).categoryBreakdown).map(([category, count]: [string, any], index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-full flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{category}</span>
                              <span className="text-sm font-bold text-[#001a4d]">{count}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${(count / stats.totalAchievements) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400 italic">
                        {stats.totalAchievements === 0 ? "No achievements submitted yet" : "No data available"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Approved Achievements */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-[#001a4d] mb-4 flex items-center gap-2">
                    <span>🏆</span> Recent Approved Achievements
                  </h3>
                  <div className="space-y-3">
                    {((stats as any).recentApproved || []).length > 0 ? (
                      (stats as any).recentApproved.map((achievement: any, index: number) => (
                        <div key={index} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">
                            ✓
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-800 truncate">{achievement.title}</p>
                            <p className="text-xs text-gray-500 mb-1">{achievement.studentName} • {new Date(achievement.date).toLocaleDateString()}</p>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
                              {achievement.category}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400 italic">
                        {stats.totalAchievements === 0 ? "No achievements submitted yet" : "No approved achievements yet"}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                    <button 
                      onClick={() => router.push('/faculty/students')}
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      View All Students →
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </Sidebar>
    </div>
  );
}
