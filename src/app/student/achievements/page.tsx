'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import { userService, UserProfile } from '@/services/userService';
import { Achievement, AchievementStatus } from '@/types';
import { AchievementList } from '@/components/AchievementComponents';
import { Navbar, Sidebar, PageLayout } from '@/components/Layout';
import { StatCard } from '@/components/ModernCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { 
  BarChart2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  LineChart, 
  ScrollText, 
  Zap 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function StudentAchievementsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]); // Includes pending/rejected for stats
  const [studentProfile, setStudentProfile] = useState<UserProfile | null>(null);
  const [achievementsLoading, setAchievementsLoading] = useState(true);

  // Skills Editing State
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [isSavingSkills, setIsSavingSkills] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'student')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch student profile for skills
          const profile = await userService.getStudentById(user.id);
          setStudentProfile(profile);

          // Fetch achievements
          const data = await achievementService.getStudentAchievements(user.id);
          setAllAchievements(data);
          
          // Only show APPROVED achievements in the timeline by default
          const approvedOnly = data.filter(a => a.status === AchievementStatus.APPROVED);
          setAchievements(approvedOnly);
        } catch (error) {
          console.error("Failed to load student dashboard data", error);
        } finally {
          setAchievementsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  // Analytics Calculations
  const total = allAchievements.length;
  const approved = allAchievements.filter(a => a.status === 'approved').length;
  const pending = allAchievements.filter(a => a.status === 'pending').length;
  const rejected = allAchievements.filter(a => a.status === 'rejected').length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Category Chart Data
  const categoryMappedData: Record<string, number> = allAchievements.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});
  
  const categoryData = Object.entries(categoryMappedData).map(([name, value]) => ({ name, value }));

  // Performance Over Time Data
  const monthlyDataMap = allAchievements.reduce((acc: any, curr) => {
    const d = new Date(curr.eventDate || curr.submittedAt || new Date());
    const month = d.toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  
  const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const performanceData = monthsOrder
    .map(month => ({ month, count: monthlyDataMap[month] || 0 }))
    .filter(item => item.count > 0); // Only show active months

  // Handle Skills
  const handleAddSkill = async () => {
    if (!newSkill.trim() || !user || !studentProfile) return;
    const updatedSkills = [...(studentProfile.skills || []), newSkill.trim()];
    
    setIsSavingSkills(true);
    try {
      await userService.updateUserSkills(user.id, updatedSkills);
      setStudentProfile({ ...studentProfile, skills: updatedSkills });
      setNewSkill('');
    } catch (e) {
      console.error("Failed to add skill", e);
    } finally {
      setIsSavingSkills(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!user || !studentProfile) return;
    const updatedSkills = (studentProfile.skills || []).filter(s => s !== skillToRemove);
    
    setIsSavingSkills(true);
    try {
      await userService.updateUserSkills(user.id, updatedSkills);
      setStudentProfile({ ...studentProfile, skills: updatedSkills });
    } catch (e) {
      console.error("Failed to remove skill", e);
    } finally {
      setIsSavingSkills(false);
    }
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center h-screen bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-yellow-400"></div></div>;
  }

  return (
    <>
      <Navbar />
      <Sidebar>
        <PageLayout title="My Dashboard" subtitle="Track your progress and analytics">
          
          {achievementsLoading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div></div>
          ) : (
            <div className="space-y-8 animate-fade-in pb-12">

              {/* Top Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Uploads" value={total} icon={<BarChart2 size={20} className="text-blue-600" />} color="blue" />
                <StatCard label="Approved" value={approved} icon={<CheckCircle size={20} className="text-green-600" />} color="green" />
                <StatCard label="Pending" value={pending} icon={<Clock size={20} className="text-amber-600" />} color="amber" />
                <StatCard label="Rejected" value={rejected} icon={<XCircle size={20} className="text-red-600" />} color="red" />
                <StatCard label="Approval Rate" value={`${approvalRate}%`} icon={<TrendingUp size={20} className="text-violet-600" />} color="violet" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Analytics Charts */}
                <div className="lg:col-span-2 space-y-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Category Distribution Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                      <h3 className="text-lg font-bold text-[#001a4d] mb-4 flex items-center gap-2">
                        <PieChartIcon size={20} className="text-[#001a4d]" /> 
                        Category Distribution
                      </h3>
                      {categoryData.length > 0 ? (
                        <div className="w-full h-[250px]">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <RechartsTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400 italic">No category data yet.</div>
                      )}
                      {/* Custom Legend */}
                      <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {categoryData.map((entry: { name: string, value: number }, index: number) => (
                          <div key={index} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                            <span className="w-3 h-3 rounded-full block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            {entry.name} ({entry.value})
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Over Time Bar Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                      <h3 className="text-lg font-bold text-[#001a4d] mb-4 flex items-center gap-2">
                        <LineChart size={20} className="text-[#001a4d]" /> 
                        Progression Outline
                      </h3>
                      {performanceData.length > 0 ? (
                        <div className="w-full h-[250px]">
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={performanceData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                              <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="count" fill="#FFBB28" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400 italic">No timeline data available.</div>
                      )}
                    </div>
                  </div>

                  {/* Timeline (Achievement List) */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                    <h3 className="text-xl font-bold text-[#001a4d] mb-6 flex items-center gap-2">
                      <ScrollText size={24} className="text-[#001a4d]" /> 
                      Recent Achievements
                    </h3>
                    <AchievementList achievements={achievements} showCertificate={true} />
                  </div>

                </div>

                {/* Right Column: Profile & Skills */}
                <div className="lg:col-span-1 space-y-8">
                  
                  {/* Student Profile Identity */}
                  <div className="bg-gradient-to-br from-[#001a4d] to-[#0033a0] p-6 rounded-2xl shadow-xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="w-24 h-24 mx-auto rounded-full bg-white flex items-center justify-center text-4xl text-[#001a4d] font-bold shadow-lg border-4 border-yellow-400 relative z-10">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-4 relative z-10">{user.name}</h2>
                    <p className="text-blue-200 text-sm mb-3 relative z-10">{user.email}</p>
                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-bold capitalize border border-white/20 relative z-10">
                      {user.department || 'No Department'}
                    </div>
                  </div>

                  {/* Specialized Skills */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#001a4d] flex items-center gap-2">
                        <Zap size={20} className="text-yellow-500" /> 
                        Specialized Skills
                      </h3>
                      <button 
                        onClick={() => setIsEditingSkills(!isEditingSkills)}
                        className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${isEditingSkills ? 'bg-gray-200 text-gray-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                        disabled={isSavingSkills}
                      >
                        {isEditingSkills ? 'Done' : 'Edit'}
                      </button>
                    </div>

                    {isEditingSkills && (
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add new skill (e.g., Python)"
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                          disabled={isSavingSkills}
                        />
                        <button 
                          onClick={handleAddSkill}
                          disabled={isSavingSkills || !newSkill.trim()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {(!studentProfile?.skills || studentProfile.skills.length === 0) ? (
                        <p className="text-sm text-gray-400 italic py-2">No skills added yet.</p>
                      ) : (
                        studentProfile.skills.map((skill, idx) => (
                          <div key={idx} className="flex items-center group relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
                            <span>{skill}</span>
                            {isEditingSkills && (
                              <button
                                onClick={() => handleRemoveSkill(skill)}
                                disabled={isSavingSkills}
                                className="ml-2 text-blue-300 hover:text-red-500 transition-colors focus:outline-none"
                                title={`Remove ${skill}`}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}
        </PageLayout>
      </Sidebar>
    </>
  );
}
