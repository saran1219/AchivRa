'use client';

import React, { useEffect, useState } from 'react';
import { Navbar, Sidebar, PageLayout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserRole, Achievement, AchievementStatus } from '@/types';
import { userService, UserProfile } from '@/services/userService';
import { achievementService } from '@/services/achievementService';
import { ModernBadge } from '@/components/ModernBadge';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { UserCircle, FileCheck, BarChart3, Activity, Eye, Download, FileText, PartyPopper, Target } from 'lucide-react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { computeYearlyTargetProgress } from '@/utils/yearlyTargetProgress';
import { filterAchievementsByTargetScope, type TargetScope } from '@/utils/targetScopeFilter';
import { compareForVerificationQueue, isStaleHighPriorityPending } from '@/utils/achievementPriority';

/** Half-ring progress: AchivRa blue (#001a4d) → green; Apple Watch–style stacked arcs. */
function YearlyTargetSemiRings({
  presentation,
  technicalCompetition,
  hackathon,
  allComplete,
}: {
  presentation: boolean;
  technicalCompetition: boolean;
  hackathon: boolean;
  allComplete: boolean;
}) {
  const cx = 72;
  const cy = 74;
  const stroke = 5;
  const rings = [
    { r: 24, done: presentation },
    { r: 35, done: technicalCompetition },
    { r: 46, done: hackathon },
  ] as const;

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[200px] select-none"
      animate={
        allComplete
          ? { scale: [1, 1.02, 1], opacity: [1, 0.98, 1] }
          : { scale: 1, opacity: 1 }
      }
      transition={allComplete ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
    >
      <svg viewBox="0 0 144 82" className="w-full h-auto drop-shadow-sm" aria-hidden>
        <defs>
          <linearGradient id="yearlyTargetRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#001a4d" />
            <stop offset="55%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        {rings.map(({ r, done }) => {
          const arcLen = Math.PI * r;
          const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;
          return (
            <g key={r}>
              <path
                d={d}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={stroke}
                strokeLinecap="round"
                opacity={0.95}
              />
              <motion.path
                d={d}
                fill="none"
                stroke="url(#yearlyTargetRingGrad)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={arcLen}
                initial={false}
                animate={{ strokeDashoffset: done ? 0 : arcLen }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              />
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
}

export default function StudentDetailView() {
  const params = useParams();
  const studentId = params?.studentId as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [student, setStudent] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);
  const [generalError, setGeneralError] = useState(false);
  const [targetScope, setTargetScope] = useState<TargetScope>('yearly');

  // Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && user && user.role !== UserRole.FACULTY && user.role !== UserRole.ADMIN) {
      router.push('/unauthorized');
    }
  }, [user, authLoading, router]);

  // Load Data
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        if (!studentId) return;
        const studentData = await userService.getStudentById(studentId);
        if (studentData) {
          setStudent(studentData);
          try {
            // Fetch achievements inside try-catch to isolate the index failure
            const studentAchievements = await achievementService.getStudentAchievements(studentId);

            // Resolve certificate URLs
            const achievementsWithUrls = await Promise.all(studentAchievements.map(async (ach: any) => {
              let fileURL = '';
              const storagePath = ach.certificateFile || ach.certificateUrl;
              if (storagePath) {
                if (storagePath.startsWith('http')) {
                  fileURL = storagePath;
                } else if (storage) {
                  try {
                    const fileRef = ref(storage, storagePath);
                    fileURL = await getDownloadURL(fileRef);
                  } catch (e) {
                    console.error('Error fetching file URL for', storagePath, e);
                  }
                }
              }
              return { ...ach, fileURL };
            }));

            setAchievements(achievementsWithUrls);
          } catch (achError: any) {
            console.error('Firebase query failed for achievements:', achError);
            if (achError?.code === 'failed-precondition' || achError?.message?.includes('index')) {
              setIndexError(true);
            } else {
              setGeneralError(true);
            }
          }
        } else {
          setGeneralError(true);
        }
      } catch (error: any) {
        console.error('Failed to fetch student details:', error);
        if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
          setIndexError(true);
        } else {
          setGeneralError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && studentId) {
      loadStudentData();
    }
  }, [user, studentId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001a4d]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-yellow-400"></div>
      </div>
    );
  }

  if (indexError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Error</h2>
          <p className="text-gray-700">Database index is building. Please refresh.</p>
        </div>
      </div>
    );
  }

  if (generalError || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Error</h2>
          <p className="text-gray-700">Unable to load student data.</p>
        </div>
      </div>
    );
  }

  const approvedCount = achievements.filter(a => a.status === 'approved').length;
  const pendingCount = achievements.filter(a => a.status === 'pending').length;
  const rejectedCount = achievements.filter(a => a.status === 'rejected').length;

  // Chart Data
  const statusData = [
    { name: 'Approved', value: approvedCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Rejected', value: rejectedCount },
  ];
  const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

  const categoryCounts = achievements.reduce((acc, ach) => {
    const cat = ach.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }));

  // Timeline Data
  const sortedAchievements = [...achievements].sort(
    (a, b) => new Date(b.updatedAt || b.submittedAt || 0).getTime() - new Date(a.updatedAt || a.submittedAt || 0).getTime()
  );
  const recentActivity = sortedAchievements.slice(0, 5);

  const scopedApprovedForTargets = filterAchievementsByTargetScope(
    achievements.filter((a) => a.status === AchievementStatus.APPROVED),
    targetScope
  );
  const yearlyTargets = computeYearlyTargetProgress(scopedApprovedForTargets);

  const sortedCertificates = [...achievements].sort((a, b) =>
    compareForVerificationQueue(a, b, 'newest')
  );

  return (
    <>
      <Navbar />
      <Sidebar>
        <PageLayout
          title="Student Profile"
          subtitle="Detailed view of student achievements"
          action={
            <Link href="/faculty/students">
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                ← Back to Directory
              </button>
            </Link>
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden relative"
                >
                  <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                  <div className="px-6 pb-6 relative">
                    <div className="w-24 h-24 mx-auto -mt-12 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center text-4xl text-blue-600 font-bold overflow-hidden">
                      {student.photoURL ? (
                        <img src={student.photoURL} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle className="w-full h-full text-blue-600" />
                      )}
                    </div>
                    <div className="text-center mt-4 space-y-1">
                      <h2 className="text-2xl font-bold text-gray-800">{student.name}</h2>
                      <p className="text-gray-500 text-sm">{student.email}</p>
                      {student.department && (
                        <div className="pt-2">
                          <ModernBadge variant="default" className="!bg-blue-100 !text-blue-800 border-none">
                            {student.department}
                          </ModernBadge>
                        </div>
                      )}

                      {/* Specialized Skills */}
                      {student.skills && student.skills.length > 0 && (
                        <div className="pt-4 mt-4 border-t border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Specialized Skills</p>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {student.skills.map((skill, idx) => (
                              <span key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 px-2.5 py-1 rounded-md text-[11px] font-bold border border-blue-100 shadow-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 p-6 grid grid-cols-3 text-center gap-4 bg-gray-50/50">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">Approved</p>
                      <p className="text-2xl font-bold text-gray-800">{approvedCount}</p>
                    </div>
                    <div className="border-x border-gray-200">
                      <p className="text-xs font-semibold uppercase tracking-wider text-yellow-600 mb-1">Pending</p>
                      <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">Rejected</p>
                      <p className="text-2xl font-bold text-gray-800">{rejectedCount}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Certificates */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 h-full flex flex-col"
                >
                  <h3 className="text-xl font-bold text-[#001a4d] mb-6 flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-blue-600" />
                    <span>Uploaded Certificates</span>
                    <span className="text-sm font-normal text-gray-400 ml-2">({achievements.length} total)</span>
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Pending items over 3 days old are highlighted and listed first for follow-up.
                  </p>

                  {achievements.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 flex-1 flex flex-col items-center justify-center">
                      <FileCheck className="w-12 h-12 mb-4 opacity-50" />
                      <p>No certificates uploaded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {sortedCertificates.map((achievement) => {
                        const urgent =
                          achievement.status === AchievementStatus.PENDING &&
                          isStaleHighPriorityPending(achievement);
                        return (
                        <div
                          key={achievement.id}
                          className={`p-4 rounded-xl hover:shadow-md transition-shadow bg-gray-50/50 flex flex-col sm:flex-row gap-4 ${
                            urgent
                              ? 'border-2 border-red-300/90 ring-1 ring-red-100'
                              : 'border border-gray-100'
                          }`}
                        >
                          <div className="w-full sm:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden group relative">
                            {(achievement as any).fileURL ? (
                              (achievement as any).fileURL.includes('.pdf') || (achievement as any).certificateFile?.includes('.pdf') || achievement.certificateFileName?.includes('.pdf') ? (
                                <div className="flex flex-col items-center justify-center gap-2 p-2 w-full h-full bg-slate-100 group-hover:bg-slate-200 transition-colors">
                                  <FileText className="w-8 h-8 text-slate-500" />
                                  <span className="text-[10px] text-slate-500 font-medium text-center">PDF Document</span>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => window.open((achievement as any).fileURL)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors" title="Preview">
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <a href={(achievement as any).fileURL} download target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors" title="Download">
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <img src={(achievement as any).fileURL} alt="Certificate" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={() => window.open((achievement as any).fileURL)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors" title="Preview">
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <a href={(achievement as any).fileURL} download target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors" title="Download">
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                </>
                              )
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-1 text-gray-400">
                                <FileCheck className="w-8 h-8 opacity-50" />
                                <span className="text-[10px] text-center px-1">Certificate unavailable</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-bold text-gray-800 text-lg truncate" title={achievement.title}>{achievement.title}</h4>
                                <ModernBadge
                                  variant={achievement.status === 'approved' ? 'success' : achievement.status === 'rejected' ? 'error' : 'warning'}
                                  size="sm"
                                >
                                  {achievement.status.toUpperCase()}
                                </ModernBadge>
                              </div>
                              <p className="text-sm text-gray-600 truncate">{achievement.description}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium text-gray-500">
                              <span className="flex items-center gap-1">📍 {achievement.category}</span>
                              {achievement.skillGroup && (
                                <span className="px-2 py-0.5 rounded-full bg-[#001a4d]/10 text-[#001a4d] font-bold uppercase tracking-wide text-[10px]">
                                  {achievement.skillGroup}
                                </span>
                              )}
                              {urgent && (
                                <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold uppercase text-[10px]">
                                  High priority
                                </span>
                              )}
                              <span className="flex items-center gap-1">📅 {new Date(achievement.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </div>

            </div >

            {/* Student Achievement Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mt-8"
            >
              <h3 className="text-xl font-bold text-[#001a4d] mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Student Achievement Analytics</span>
              </h3>

              {
                achievements.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No achievements submitted yet to analyze.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 xl:items-stretch">
                    <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="h-[260px] flex flex-col items-center">
                        <h4 className="text-sm font-semibold text-gray-500 mb-2">Status Distribution</h4>
                        <div className="w-full flex-1 min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              >
                                {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              />
                              <Legend iconType="circle" />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="h-[260px] flex flex-col items-center">
                        <h4 className="text-sm font-semibold text-gray-500 mb-2">Achievements by Category</h4>
                        <div className="w-full flex-1 min-h-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis
                                dataKey="category"
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                allowDecimals={false}
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                axisLine={false}
                                tickLine={false}
                                width={30}
                              />
                              <Tooltip
                                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              />
                              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2ff] p-6 flex flex-col shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08)] min-h-[200px] ring-1 ring-white/60 backdrop-blur-sm">
                      <h4 className="text-sm font-bold text-[#001a4d] uppercase tracking-wide mb-1 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600" aria-hidden />
                        Yearly Target Progress
                      </h4>
                      <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                        Tracks approved work toward Presentation, Technical Competition, and Hackathon
                        (e.g. Paper Presentation, Coding Competition, Hackathon).
                      </p>

                      <div
                        className="flex rounded-xl bg-slate-100/90 p-1 mb-4 gap-1"
                        role="group"
                        aria-label="Target period"
                      >
                        <button
                          type="button"
                          onClick={() => setTargetScope('yearly')}
                          className={`flex-1 min-w-0 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            targetScope === 'yearly'
                              ? 'bg-white text-[#001a4d] shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Yearly targets
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetScope('semester')}
                          className={`flex-1 min-w-0 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            targetScope === 'semester'
                              ? 'bg-white text-[#001a4d] shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          Semester targets
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-3">
                        Yearly: approved submissions in the current calendar year. Semester: Jan–Jun or Jul–Dec (by submitted date).
                      </p>

                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 text-center">
                        Progress rings
                      </p>
                      <div className="mb-5 rounded-2xl bg-white/70 border border-slate-100/90 px-4 py-5 shadow-inner">
                        <YearlyTargetSemiRings
                          presentation={yearlyTargets.presentation}
                          technicalCompetition={yearlyTargets.technicalCompetition}
                          hackathon={yearlyTargets.hackathon}
                          allComplete={yearlyTargets.allComplete}
                        />
                      </div>

                      <ul className="space-y-2.5 flex-1 border-t border-slate-100 pt-4">
                        {(
                          [
                            { key: 'presentation', label: 'Presentation', done: yearlyTargets.presentation },
                            { key: 'technicalCompetition', label: 'Technical Competition', done: yearlyTargets.technicalCompetition },
                            { key: 'hackathon', label: 'Hackathon', done: yearlyTargets.hackathon },
                          ] as const
                        ).map((item) => (
                          <li key={item.key} className="rounded-lg px-2 py-1.5 -mx-2 hover:bg-white/60 transition-colors">
                            <span
                              className={`text-sm ${item.done ? 'text-slate-900 font-semibold' : 'text-slate-500 font-medium'}`}
                            >
                              {item.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {yearlyTargets.allComplete && (
                        <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 px-4 py-3 text-emerald-900 shadow-sm">
                          <PartyPopper className="w-5 h-5 flex-shrink-0 text-emerald-600" aria-hidden />
                          <span className="text-sm font-bold">Yearly Target Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
            </motion.div>

            {/* Student Achievement Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mt-8"
            >
              <h3 className="text-xl font-bold text-[#001a4d] mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Student Achievement Timeline</span>
              </h3>

              {
                achievements.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((achievement) => (
                      <div key={achievement.id} className="relative pl-6 border-l-2 border-slate-200 pb-2 last:pb-0 last:border-0">
                        <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${achievement.status === 'approved' ? 'bg-green-500' :
                          achievement.status === 'rejected' ? 'bg-red-500' :
                            'bg-yellow-400'
                          }`}></div>
                        <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-start md:items-center gap-3 mb-2 flex-col md:flex-row">
                              <h4 className="font-bold text-gray-800 text-base leading-tight">{achievement.title}</h4>
                              <ModernBadge
                                variant={achievement.status === 'approved' ? 'success' : achievement.status === 'rejected' ? 'error' : 'warning'}
                                size="sm"
                                className="h-6"
                              >
                                {achievement.status.toUpperCase()}
                              </ModernBadge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                              <span className="flex items-center gap-1"><FileCheck className="w-3.5 h-3.5" /> {achievement.category}</span>
                              {achievement.skillGroup && (
                                <span className="text-[10px] font-bold uppercase text-[#001a4d] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                  {achievement.skillGroup}
                                </span>
                              )}
                              <span className="flex items-center gap-1">📅 {new Date(achievement.updatedAt || achievement.submittedAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                            </div>
                            {achievement.remarks && (achievement.status === 'approved' || achievement.status === 'rejected') && (
                              <div className="mt-3 text-xs text-slate-700 bg-amber-50/80 border border-amber-100 rounded-lg px-3 py-2">
                                <span className="font-bold text-amber-900 uppercase tracking-wide text-[10px] block mb-1">Faculty remarks</span>
                                <span className="italic">&ldquo;{achievement.remarks}&rdquo;</span>
                              </div>
                            )}
                          </div>

                          {achievement.certificateUrl && (
                            <a
                              href={achievement.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors self-start md:self-auto"
                            >
                              <Eye className="w-4 h-4" /> View Proof
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </motion.div>
          </motion.div>
        </PageLayout>
      </Sidebar>
    </>
  );
}
