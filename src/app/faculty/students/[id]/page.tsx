'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navbar, Sidebar } from '@/components/Layout';
import { useRouter } from 'next/navigation';
import { doc, getDoc, query, collection, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { User, Achievement, AchievementStatus } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function StudentDetailPage({ params }: PageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [student, setStudent] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !params.id) return;

      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Student Profile
        const studentDoc = await getDoc(doc(db, 'users', params.id));
        
        if (!studentDoc.exists()) {
          setError('Student not found');
          setLoading(false);
          return;
        }

        const studentData = { id: studentDoc.id, ...studentDoc.data() } as User;

        // 2. Security Check: Role Match
        if (user.role !== 'faculty') {
          setError('Access Denied: Only faculty can view this page.');
          setLoading(false);
          return;
        }

        setStudent(studentData);

        // 3. Fetch Achievements
        const q = query(
          collection(db, 'achievements'),
          where('studentId', '==', params.id),
          orderBy('submittedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const achievementsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          eventDate: doc.data().eventDate?.toDate() || new Date(),
          submittedAt: doc.data().submittedAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          verificationDate: doc.data().verificationDate?.toDate() || null,
        })) as Achievement[];

        setAchievements(achievementsData);

      } catch (err) {
        console.error('Error fetching student details:', err);
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, params.id]);

  if (authLoading || loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Sidebar>
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
              <div className="text-red-500 text-5xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={() => router.push('/faculty/students')}
                className="px-6 py-2 bg-[#001a4d] text-white rounded-lg hover:bg-blue-900 transition-colors"
              >
                Back to Directory
              </button>
            </div>
          </div>
        </Sidebar>
      </div>
    );
  }

  if (!student) return null;

  // Calculate Metrics
  const total = achievements.length;
  const approved = achievements.filter(a => a.status === AchievementStatus.APPROVED).length;
  const pending = achievements.filter(a => a.status === AchievementStatus.PENDING).length;
  const rejected = achievements.filter(a => a.status === AchievementStatus.REJECTED).length;
  const approvalRate = total === 0 ? 0 : Math.round((approved / total) * 100);

  // Calculate Category Breakdown
  const categoryCounts: { [key: string]: number } = {};
  achievements.forEach(a => {
    const cat = a.category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar>
        <div className="flex flex-col h-full bg-gradient-to-br from-[#001a4d] to-[#0033a0] p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full space-y-8 animate-fade-in pb-12">
            
            {/* Header & Back Button */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/faculty/students')}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                title="Back to Directory"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Student Performance Dashboard</h1>
                <p className="text-blue-200">View detailed performance metrics and history</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Profile & Category Breakdown */}
              <div className="space-y-8">
                
                {/* Section A: Student Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="h-24 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                  <div className="px-8 pb-8 relative">
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg absolute -top-12 flex items-center justify-center text-4xl font-bold text-gray-700">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="mt-14">
                      <h2 className="text-2xl font-bold text-[#001a4d]">{student.name}</h2>
                      <p className="text-gray-500 font-medium">{student.role === 'student' ? 'Student' : student.role}</p>
                      
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">📧</span>
                          <span className="text-sm">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">🏢</span>
                          <span className="text-sm font-bold">{student.department || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Specialized Skills */}
                      <div className="mt-6">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {(student as any).skills && (student as any).skills.length > 0 ? (
                            (student as any).skills.map((skill: string, index: number) => (
                              <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-400 italic text-xs">No skills added yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C: Category Breakdown */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-bold text-[#001a4d] mb-4 flex items-center gap-2">
                    <span>📊</span> Category Breakdown
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(categoryCounts).length > 0 ? (
                      Object.entries(categoryCounts).map(([category, count]) => (
                        <div key={category}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{category}</span>
                            <span className="text-sm font-bold text-[#001a4d]">{count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                              style={{ width: `${(count / total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 italic text-sm text-center py-4">No data available</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Performance & History */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Section B: Performance Overview Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Approval Rate */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-4 text-white shadow-lg">
                    <div className="text-3xl font-bold mb-1">{approvalRate}%</div>
                    <div className="text-purple-100 text-xs font-medium uppercase tracking-wide">Approval Rate</div>
                  </div>
                  
                  {/* Approved */}
                  <div className="bg-white rounded-xl p-4 shadow-lg border-b-4 border-green-500">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{approved}</div>
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wide">Approved</div>
                  </div>

                  {/* Pending */}
                  <div className="bg-white rounded-xl p-4 shadow-lg border-b-4 border-yellow-400">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{pending}</div>
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wide">Pending</div>
                  </div>

                  {/* Rejected */}
                  <div className="bg-white rounded-xl p-4 shadow-lg border-b-4 border-red-500">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{rejected}</div>
                    <div className="text-gray-500 text-xs font-medium uppercase tracking-wide">Rejected</div>
                  </div>
                </div>

                {/* Section D: Achievement Timeline */}
                <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[500px]">
                  <h3 className="text-xl font-bold text-[#001a4d] mb-6 flex items-center gap-2">
                    <span>🏆</span> Achievement Timeline
                  </h3>

                  <div className="space-y-4">
                    {achievements.length > 0 ? (
                      achievements.map((achievement) => (
                        <div key={achievement.id} className="relative pl-6 border-l-2 border-gray-100 pb-6 last:pb-0 last:border-0 hover:border-blue-200 transition-colors">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            achievement.status === AchievementStatus.APPROVED ? 'bg-green-500' :
                            achievement.status === AchievementStatus.REJECTED ? 'bg-red-500' :
                            'bg-yellow-400'
                          }`}></div>

                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-bold text-[#001a4d] text-lg mb-1">{achievement.title}</h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-2">
                                  <span className="flex items-center gap-1">
                                    📂 <span className="font-medium text-gray-700">{achievement.category}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    🏢 {achievement.organizationName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    📅 {new Date(achievement.eventDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2 min-w-[120px]">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                  achievement.status === AchievementStatus.APPROVED
                                    ? 'bg-green-100 text-green-700 border-green-200'
                                    : achievement.status === AchievementStatus.REJECTED
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                }`}>
                                  {achievement.status}
                                </span>

                                {(achievement.fileUrls && achievement.fileUrls.length > 0) || achievement.certificateUrl ? (
                                  <a 
                                    href={achievement.fileUrls?.[0] || achievement.certificateUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
                                  >
                                    📄 Certificate
                                  </a>
                                ) : null}
                              </div>
                            </div>
                            
                            {/* Rejected Remarks */}
                            {achievement.status === AchievementStatus.REJECTED && achievement.remarks && (
                              <div className="mt-3 bg-red-50 p-2 rounded text-sm text-red-700 border border-red-100">
                                <strong>Reason:</strong> {achievement.remarks}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <span className="text-4xl mb-3">📭</span>
                        <p>No achievements submitted yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </Sidebar>
    </div>
  );
}
