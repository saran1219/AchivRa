'use client';

import { Navbar, Sidebar, PageLayout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserRole, Achievement } from '@/types';
import { achievementService } from '@/services/achievementService';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { 
  FileStack, 
  Clock, 
  BadgeCheck, 
  XCircle,
  ClipboardCheck,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

export default function VerificationDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    // Protect route - Only Verification Team
    if (!authLoading && user) {
      if (user.role !== "verification_team") {
        router.push('/');
        return;
      } else {
        console.log("Navigating to:", "/verification/dashboard");
      }
    }

    const loadData = async () => {
      try {
        const stats = await achievementService.getAllAchievements();
        setAchievements(stats);
      } catch (error) {
        console.error('Failed to load dashboard stats', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  if (authLoading || dataLoading || !user) {
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

  const pendingCount = achievements.filter(a => a.status === 'pending').length;
  const approvedCount = achievements.filter(a => a.status === 'approved').length;
  const rejectedCount = achievements.filter(a => a.status === 'rejected').length;

  // Chart Data Processing
  const COLORS = ['#10b981', '#ef4444', '#f59e0b']; // Green, Red, Yellow
  const pieData = [
    { name: 'Approved', value: approvedCount },
    { name: 'Rejected', value: rejectedCount },
    { name: 'Pending', value: pendingCount }
  ].filter(d => d.value > 0);

  const categoryMappedData: Record<string, number> = achievements.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(categoryMappedData).map(([name, value]) => ({ name, value }));

  // Recent Activity Feed
  const recentActivity = [...achievements]
    .filter(a => a.status !== 'pending' && a.verificationDate)
    .sort((a, b) => new Date(b.verificationDate!).getTime() - new Date(a.verificationDate!).getTime())
    .slice(0, 5);

  const getBadgeStyle = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar>

        <PageLayout title="Verification Overview" subtitle="High-level metrics for student certificate verification">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Submissions</p>
                <p className="text-4xl font-extrabold text-[#001a4d]">{achievements.length}</p>
              </div>
              <div className="text-blue-500 opacity-80"><FileStack className="w-8 h-8 text-slate-500" /></div>
            </motion.div>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
              <Link href="/verification/queue" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-between group cursor-pointer block h-full">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-yellow-500 transition-colors">Pending Review</p>
                  <p className="text-4xl font-extrabold text-[#001a4d]">{pendingCount}</p>
                </div>
                <div className="text-yellow-500 opacity-80 group-hover:scale-110 transition-transform"><Clock className="w-8 h-8 text-slate-500" /></div>
              </Link>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
              <Link href="/verification/approved" className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-between group cursor-pointer block h-full">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-green-500 transition-colors">Approved</p>
                  <p className="text-4xl font-extrabold text-[#001a4d]">{approvedCount}</p>
                </div>
                <div className="text-green-500 opacity-80 group-hover:scale-110 transition-transform"><BadgeCheck className="w-8 h-8 text-slate-500" /></div>
              </Link>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Rejected</p>
                <p className="text-4xl font-extrabold text-[#001a4d]">{rejectedCount}</p>
              </div>
              <div className="text-red-500 opacity-80 relative group hover:scale-110 transition-transform">
                 <XCircle className="w-8 h-8 text-slate-500" />
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-white/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#001a4d] to-transparent opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none"></div>
            <h2 className="text-2xl font-bold text-[#001a4d] mb-6 flex items-center gap-2">
              <ClipboardCheck size={24} className="text-[#001a4d]" /> Quick Actions
            </h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/verification/queue" className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl hover:scale-[1.02] hover:shadow-md hover:border-orange-200 transition-all duration-200 group">
                  <div className="p-3 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors"><ClipboardCheck size={20} /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors">Process Queue</h3>
                    <p className="text-xs text-gray-500">Review pending certificates</p>
                  </div>
                </Link>
                
                <Link href="/verification/approved" className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl hover:scale-[1.02] hover:shadow-md hover:border-green-200 transition-all duration-200 group">
                  <div className="p-3 bg-green-100 rounded-lg text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors"><BadgeCheck size={20} /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">View Approved</h3>
                    <p className="text-xs text-gray-500">Search verified records</p>
                  </div>
                </Link>

                <Link href="/verification/rejected" className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl hover:scale-[1.02] hover:shadow-md hover:border-red-200 transition-all duration-200 group cursor-pointer">
                  <div className="p-3 bg-red-100 rounded-lg text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors"><XCircle size={20} /></div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">View Rejected</h3>
                    <p className="text-xs text-gray-500">Auditing and appeals</p>
                  </div>
                </Link>
             </div>
          </motion.div>

          {/* Analytics Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-[#001a4d] mb-4 flex items-center gap-2">
                <PieChartIcon size={20} className="text-[#001a4d]"/> Verification Status Breakdown
              </h3>
              {pieData.length > 0 ? (
                <div className="w-full h-[260px]">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-gray-400 italic">No verification data</div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-[#001a4d] mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#001a4d]"/> Submission Trend by Category
              </h3>
              {barData.length > 0 ? (
                <div className="w-full h-[260px]">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#001a4d" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-gray-400 italic">No category data</div>
              )}
            </div>
          </motion.div>

          {/* Recent Verification Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-[#001a4d] mb-6 flex items-center gap-2">
              <Activity size={24} className="text-[#001a4d]"/> Recent Verification Activity
            </h3>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#001a4d]/10 flex items-center justify-center text-[#001a4d] font-bold">
                        {activity.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{activity.studentName}</p>
                        <p className="text-sm text-gray-500">{activity.title}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getBadgeStyle(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {activity.verificationDate ? new Date(activity.verificationDate).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50"
              >
                <ClipboardCheck size={32} className="text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No recent verification activity yet</p>
                <p className="text-xs text-gray-400 mt-1">Processed certificates will appear here</p>
              </motion.div>
            )}
          </motion.div>

        </PageLayout>
      </Sidebar>
    </>
  );
}
