'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import { adminService } from '@/services/adminService';
import { Achievement } from '@/types';
import { Navbar, Sidebar, PageLayout } from '@/components/Layout';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchData = async () => {
      const statsData = await adminService.getDashboardStats();
      const achievementsData = await achievementService.getAllAchievements();
      setStats(statsData);
      setAchievements(achievementsData);
      setAchievementsLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <Sidebar>
        <PageLayout title="Admin Dashboard">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {stats && (
              <>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <h3 className="text-gray-600 text-sm font-medium">Total</h3>
                  <p className="text-2xl font-bold mt-2">{stats.totalAchievements}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <h3 className="text-gray-600 text-sm font-medium">Approved</h3>
                  <p className="text-2xl font-bold mt-2 text-green-600">{stats.approvedAchievements}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <h3 className="text-gray-600 text-sm font-medium">Pending</h3>
                  <p className="text-2xl font-bold mt-2 text-yellow-600">{stats.pendingAchievements}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <h3 className="text-gray-600 text-sm font-medium">Rejected</h3>
                  <p className="text-2xl font-bold mt-2 text-red-600">{stats.rejectedAchievements}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <h3 className="text-gray-600 text-sm font-medium">Students</h3>
                  <p className="text-2xl font-bold mt-2">{stats.totalStudents}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow text-center">
                  <h3 className="text-gray-600 text-sm font-medium">Faculty</h3>
                  <p className="text-2xl font-bold mt-2">{stats.totalFaculty}</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Recent Achievements</h2>
            {achievementsLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">Student</th>
                      <th className="p-3 text-left">Achievement</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievements.slice(0, 10).map((achievement) => (
                      <tr key={achievement.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{achievement.studentName}</td>
                        <td className="p-3">{achievement.title}</td>
                        <td className="p-3">{achievement.category}</td>
                        <td className="p-3">
                          <span className={`px-3 py-1 rounded text-white text-sm ${
                            achievement.status === 'approved' ? 'bg-green-600' :
                            achievement.status === 'rejected' ? 'bg-red-600' :
                            'bg-yellow-600'
                          }`}>
                            {achievement.status}
                          </span>
                        </td>
                        <td className="p-3">{new Date(achievement.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </PageLayout>
      </Sidebar>
    </>
  );
}
