'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import { Achievement, AchievementStatus } from '@/types';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

export const VerifiedAchievementsComponent = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filter, setFilter] = useState<'approved' | 'rejected' | 'all'>('all');
  const [showAllModal, setShowAllModal] = useState(false);

  useEffect(() => {
    loadVerifiedAchievements();
  }, []);

  const loadVerifiedAchievements = async () => {
    setLoading(true);
    try {
      const allAchievements = await achievementService.getAllAchievements();
      
      // Filter by verified status and department
      const filtered = allAchievements.filter(a => {
        // Show only approved and rejected (verified) achievements
        if (a.status !== AchievementStatus.APPROVED && a.status !== AchievementStatus.REJECTED) {
          return false;
        }
        
        // Filter by department - faculty can only see same department students
        if (user?.department && a.studentDepartment && a.studentDepartment !== user.department) {
          return false;
        }
        
        return true;
      });
      
      setAchievements(filtered);
    } catch (err) {
      addToast('Failed to load achievements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Filter and sort achievements
  const getFilteredAndSortedAchievements = () => {
    let filtered = achievements;

    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(a => a.status === filter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.studentName.toLowerCase().includes(search) ||
        a.studentEmail.toLowerCase().includes(search) ||
        (a.studentDepartment || a.department || '').toLowerCase().includes(search) ||
        a.title.toLowerCase().includes(search)
      );
    }

    // Sort by date
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.submittedAt).getTime();
      const dateB = new Date(b.submittedAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a4d] to-[#0033a0] animate-fade-in">
      {/* Toast Notifications */}
      <div className="fixed top-24 right-6 space-y-3 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-slide-in-right px-5 py-3 rounded-xl shadow-2xl text-white text-sm font-bold max-w-xs transition-all duration-300 flex items-center gap-3 backdrop-blur-md border border-white/20 ${
              toast.type === 'success' ? 'bg-green-500/90' :
              toast.type === 'error' ? 'bg-red-500/90' :
              toast.type === 'warning' ? 'bg-amber-500/90' :
              'bg-blue-500/90'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span>✅</span> Verified Achievements
          </h1>
          <p className="text-blue-100/80 text-lg">Browse approved and rejected student submissions</p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-5 mb-8 space-y-4 animate-slide-up bg-opacity-95 backdrop-blur-sm">
          {/* Search Bar */}
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-[#001a4d] transition-colors">🔍</span>
            <input
              type="text"
              placeholder="Search by student name, email, title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#001a4d] focus:ring-0 text-gray-700 transition-all font-medium bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Sort Buttons */}
            <div className="flex gap-2">
              {(['newest', 'oldest'] as const).map(order => (
                <button
                  key={order}
                  onClick={() => setSortOrder(order)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    sortOrder === order
                      ? 'bg-[#001a4d] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {order === 'newest' ? '📅 Newest' : '📅 Oldest'}
                </button>
              ))}
            </div>

            {/* Results Count & Export */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full">
                {getFilteredAndSortedAchievements().length} results
              </span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-100">
            {(['approved', 'rejected', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  filter === f
                    ? 'bg-yellow-400 text-[#001a4d] shadow-md transform -translate-y-0.5'
                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                {f === 'approved' && `✅ Approved`}
                {f === 'rejected' && `❌ Rejected`}
                {f === 'all' && `All Records`}
              </button>
            ))}
            <button
               onClick={() => setShowAllModal(true)}
               className="ml-auto px-4 py-2 rounded-lg text-sm font-bold bg-[#001a4d] text-white hover:bg-[#0033a0] transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
               <span>📥</span> Export Data
            </button>
          </div>
        </div>

        {/* Master-Detail Layout - Horizontal Scrolling */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Master List - Horizontal Scrolling */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden flex flex-col h-[650px] border border-white/20">
               <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center">
                <span>Achievement List</span>
                <span className="text-xs font-normal text-gray-500">Scroll for more ↓</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#001a4d] border-t-yellow-400"></div>
                </div>
              ) : getFilteredAndSortedAchievements().length === 0 ? (
                <div className="flex items-center justify-center h-full flex-col p-8 opacity-60">
                  <div className="text-6xl mb-4 grayscale">📭</div>
                  <p className="text-gray-900 font-medium text-center">{searchTerm ? 'No matches found' : 'No verified items'}</p>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 p-3 space-y-3 custom-scrollbar">
                    {getFilteredAndSortedAchievements().map((achievement) => (
                      <button
                        key={achievement.id}
                        onClick={() => setSelectedAchievement(achievement)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 border-2 relative group ${
                          selectedAchievement?.id === achievement.id
                            ? 'bg-[#001a4d] text-white border-[#001a4d] shadow-lg scale-[1.02] z-10'
                            : 'bg-white text-gray-700 border-gray-100 hover:border-yellow-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg text-xl shrink-0 ${
                            selectedAchievement?.id === achievement.id ? 'bg-white/20' : 'bg-gray-100'
                          }`}>
                            {achievement.status === 'approved' && '✅'}
                            {achievement.status === 'rejected' && '❌'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm line-clamp-2 leading-tight mb-1">{achievement.title}</p>
                            <p className={`text-xs font-medium ${selectedAchievement?.id === achievement.id ? 'text-blue-200' : 'text-gray-500'}`}>
                              {achievement.studentName}
                            </p>
                             <div className="flex items-center gap-2 mt-2">
                               <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                                 selectedAchievement?.id === achievement.id 
                                  ? 'bg-yellow-400 text-[#001a4d]' 
                                  : 'bg-gray-100 text-gray-600'
                               }`}>
                                 {new Date(achievement.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                               </span>
                            </div>
                          </div>
                          {selectedAchievement?.id === achievement.id && (
                             <div className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-400 text-xl font-bold">›</div>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel - Right Side */}
          <div className="w-full lg:w-2/3">
            {selectedAchievement ? (
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] animate-fade-in border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#001a4d] to-[#0033a0] p-6 text-white flex-shrink-0 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl transform rotate-12">🏆</div>
                   <div className="relative z-10">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 border border-white/20">
                      {selectedAchievement.category}
                    </span>
                    <h2 className="text-2xl font-bold leading-tight mb-2">{selectedAchievement.title}</h2>
                    <div className="flex items-center gap-2 text-blue-100 text-sm font-medium">
                      <span>👤 {selectedAchievement.studentName}</span>
                      <span>•</span>
                      <span>{selectedAchievement.studentDepartment || selectedAchievement.department}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  
                  {/* Grid Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                       <p className="text-xs font-bold text-[#001a4d] uppercase tracking-wider mb-2 opacity-60">Organization</p>
                       <p className="font-semibold text-gray-800 text-lg">{selectedAchievement.organizationName}</p>
                    </div>
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-[#001a4d] uppercase tracking-wider mb-2 opacity-60">Verified Date</p>
                        <p className="font-semibold text-gray-800 text-lg">{new Date(selectedAchievement.updatedAt || new Date()).toLocaleDateString()}</p>
                     </div>
                  </div>

                  {/* Description */}
                  <div>
                     <h3 className="text-lg font-bold text-[#001a4d] mb-3 flex items-center gap-2">
                       📝 Description
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed">
                       {selectedAchievement.description}
                    </div>
                  </div>

                  {/* Certificate */}
                  {selectedAchievement.certificateUrl && (
                    <div>
                      <h3 className="text-lg font-bold text-[#001a4d] mb-3 flex items-center gap-2">
                        📜 Certificate Proof
                      </h3>
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 hover:border-[#001a4d] transition-colors bg-gray-50/50">
                        {selectedAchievement.certificateUrl.includes('.pdf') ? (
                          <a
                            href={selectedAchievement.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 group p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all"
                          >
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl text-red-500 group-hover:scale-110 transition-transform">
                              📄
                            </div>
                            <div>
                               <p className="font-bold text-gray-800 group-hover:text-[#001a4d] transition-colors">Certificate.pdf</p>
                               <p className="text-xs text-blue-600 font-medium mt-1">Click to view/download</p>
                            </div>
                          </a>
                        ) : (
                          <div className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                            <img
                              src={selectedAchievement.certificateUrl}
                              alt="Certificate"
                              className="w-full object-contain max-h-[400px] bg-gray-100"
                            />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <a 
                                 href={selectedAchievement.certificateUrl} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="px-6 py-2 bg-white text-gray-900 rounded-lg font-bold hover:bg-yellow-400 transition-colors transform hover:scale-105 shadow-xl"
                               >
                                 View Full Size
                               </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Final Status */}
                  <div className={`p-6 rounded-xl border-2 ${
                    selectedAchievement.status === 'approved' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-2xl">{selectedAchievement.status === 'approved' ? '✅' : '❌'}</span>
                       <h3 className="font-bold text-lg capitalize">{selectedAchievement.status}</h3>
                    </div>
                    {selectedAchievement.remarks && (
                      <div className="mt-2 pl-9">
                          <p className="text-sm font-bold opacity-70 uppercase tracking-wider text-xs mb-1">Remarks</p>
                          <p className="font-medium">{selectedAchievement.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 h-[650px] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                 <div className="w-24 h-24 bg-blue-50 text-[#001a4d] rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
                   👈
                </div>
                <h3 className="text-2xl font-bold text-[#001a4d] mb-2">No Achievement Selected</h3>
                <p className="text-gray-500 max-w-xs">Select an item from the list on the left to view details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 26, 77, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 26, 77, 0.4);
        }
        
         @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>

      {/* Export / data modal placeholder (if functional, keep logic but update style) */}
      {showAllModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center animate-slide-up">
              <div className="w-20 h-20 bg-blue-100 text-[#001a4d] rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                 📥
              </div>
              <h2 className="text-2xl font-bold text-[#001a4d] mb-3">Export Data</h2>
              <p className="text-gray-600 mb-8">This feature is currently being implemented. Check back soon!</p>
              <button 
                onClick={() => setShowAllModal(false)}
                className="px-8 py-3 bg-[#001a4d] text-white rounded-xl font-bold hover:bg-[#0033a0] transition-transform hover:scale-105"
              >
                Close Dialog
              </button>
           </div>
         </div>
      )}
    </div>
  );
};
