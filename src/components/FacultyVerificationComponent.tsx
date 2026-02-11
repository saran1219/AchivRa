'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import { notificationService } from '@/services/notificationService';
import { Achievement, AchievementStatus } from '@/types';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

export const FacultyVerificationComponent = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [remarks, setRemarks] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showAllModal, setShowAllModal] = useState(false);

  useEffect(() => {
    loadPendingAchievements();
  }, [filter]);

  const loadPendingAchievements = async () => {
    setLoading(true);
    try {
      // If faculty has a department, load only achievements from their department
      let achievements_list: Achievement[] = [];
      
      if (user?.department) {
        // Load all achievements from the same department
        const allAchievements = await achievementService.getAllAchievements();
        achievements_list = allAchievements.filter(a => 
          a.studentDepartment === user.department || a.department === user.department
        );
      } else {
        // If no department assigned, load all (admin case)
        achievements_list = await achievementService.getAllAchievements();
      }
      
      // Filter by status
      const filtered = achievements_list.filter(a => {
        if (filter !== 'all' && a.status !== filter) return false;
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

  // Filter and sort achievements based on search term and sort order
  const getFilteredAndSortedAchievements = () => {
    let filtered = achievements;

    // Search filter - by name, email, and department
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = achievements.filter(a => 
        a.studentName.toLowerCase().includes(search) ||
        a.studentEmail.toLowerCase().includes(search) ||
        (a.studentDepartment || a.department || '').toLowerCase().includes(search)
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

  const handleApprove = async () => {
    if (!selectedAchievement || !user) return;

    // Department validation - prevent cross-department approval
    if (user.department !== (selectedAchievement.studentDepartment || selectedAchievement.department)) {
      addToast('❌ Cannot approve: Student is from a different department!', 'error');
      return;
    }

    setVerifying(true);
    try {
      await achievementService.updateAchievementStatus(
        selectedAchievement.id,
        AchievementStatus.APPROVED,
        remarks,
        user.id,
        user.name,
        user.department || ''
      );

      // Send notification to student
      await notificationService.createNotification(
        selectedAchievement.studentId,
        `🎉 Your achievement "${selectedAchievement.title}" has been APPROVED by ${user.name} (${user.department})!`,
        'approval',
        selectedAchievement.id
      );

      addToast('✓ Achievement approved!', 'success');
      setSelectedAchievement(null);
      setRemarks('');
      loadPendingAchievements();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to approve achievement';
      addToast(errorMsg, 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAchievement || !user) return;

    // Department validation - prevent cross-department rejection
    if (user.department !== (selectedAchievement.studentDepartment || selectedAchievement.department)) {
      addToast('❌ Cannot reject: Student is from a different department!', 'error');
      return;
    }

    setVerifying(true);
    try {
      await achievementService.updateAchievementStatus(
        selectedAchievement.id,
        AchievementStatus.REJECTED,
        remarks || 'Rejected by faculty',
        user.id,
        user.name,
        user.department || ''
      );

      // Send notification to student
      await notificationService.createNotification(
        selectedAchievement.studentId,
        `⚠️ Your achievement "${selectedAchievement.title}" has been REJECTED by ${user.name} (${user.department}). Remarks: ${remarks}`,
        'rejection',
        selectedAchievement.id
      );

      addToast('✓ Achievement rejected!', 'success');
      setSelectedAchievement(null);
      setRemarks('');
      loadPendingAchievements();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reject achievement';
      addToast(errorMsg, 'error');
    } finally {
      setVerifying(false);
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
            <span>👨‍🏫</span> Verification Queue
          </h1>
          <p className="text-blue-100/80 text-lg">Review and approve student achievements from your department</p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-5 mb-8 space-y-4 animate-slide-up bg-opacity-95 backdrop-blur-sm">
          {/* Search Bar */}
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-[#001a4d] transition-colors">🔍</span>
            <input
              type="text"
              placeholder="Search by student name, email..."
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

            {/* Results Count */}
            <span className="text-sm text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full">
              {getFilteredAndSortedAchievements().length} results
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-100">
            {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  filter === f
                    ? 'bg-yellow-400 text-[#001a4d] shadow-md transform -translate-y-0.5'
                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                {f === 'pending' && `⏳ Pending (${achievements.filter(a => a.status === 'pending').length})`}
                {f === 'approved' && `✅ Approved (${achievements.filter(a => a.status === 'approved').length})`}
                {f === 'rejected' && `❌ Rejected (${achievements.filter(a => a.status === 'rejected').length})`}
                {f === 'all' && `All (${achievements.length})`}
              </button>
            ))}
            <button
              onClick={() => setShowAllModal(true)}
              className="ml-auto px-4 py-2 rounded-lg text-sm font-bold bg-[#001a4d] text-white hover:bg-[#0033a0] transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>📊</span> View All Queue
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
                  <p className="text-gray-900 font-medium text-center">{searchTerm ? 'No matches found' : 'No achievements in this queue'}</p>
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
                            {achievement.status === 'pending' && '⏳'}
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
                                 {new Date(achievement.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
                       <p className="text-xs font-bold text-[#001a4d] uppercase tracking-wider mb-2 opacity-60">Event Date</p>
                       <p className="font-semibold text-gray-800 text-lg">{new Date(selectedAchievement.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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

                  {/* Status Banner */}
                  {selectedAchievement.status !== 'pending' && (
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
                      
                      <div className="mt-4 pt-4 border-t border-black/5 pl-9 flex gap-6 text-sm opacity-80 font-medium">
                         <span>Verified by: {user?.name || 'Faculty'}</span>
                         <span>Date: {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification Form */}
                {selectedAchievement.status === 'pending' && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50 flex-shrink-0">
                    <h3 className="text-sm font-bold text-[#001a4d] mb-3 uppercase tracking-wider">Verification Actions</h3>
                    <div className="flex flex-col gap-4">
                       <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add remarks or feedback for the student..."
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#001a4d] focus:ring-1 focus:ring-[#001a4d] text-sm resize-none bg-white transition-shadow focus:shadow-md"
                      />
                      <div className="flex gap-4">
                        <button
                          onClick={handleApprove}
                          disabled={verifying}
                          className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 transition-all transform active:scale-95 font-bold flex items-center justify-center gap-2 text-lg"
                        >
                          {verifying ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : '✅ Approve'}
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={verifying}
                          className="flex-1 px-6 py-3 bg-white text-red-500 border-2 border-red-100 hover:bg-red-50 hover:border-red-200 hover:shadow-lg disabled:opacity-50 transition-all transform active:scale-95 font-bold flex items-center justify-center gap-2 text-lg"
                        >
                          {verifying ? (
                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : '❌ Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 h-[650px] flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                <div className="w-24 h-24 bg-blue-50 text-[#001a4d] rounded-full flex items-center justify-center text-5xl mb-6 shadow-inner">
                   👈
                </div>
                <h3 className="text-2xl font-bold text-[#001a4d] mb-2">No Achievement Selected</h3>
                <p className="text-gray-500 max-w-xs">Select an item from the list on the left to view details and take action.</p>
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

      {/* All Queue Items Modal */}
      {showAllModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="bg-[#001a4d] text-white p-6 flex-shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span>📊</span> Full Queue Overview
                </h2>
                <p className="text-blue-200 text-sm mt-1 font-medium">
                  Total: {achievements.length} • Pending: {achievements.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    onClick={() => {
                      setSelectedAchievement(achievement);
                      setShowAllModal(false);
                    }}
                    className={`bg-white p-5 rounded-xl border-2 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                      achievement.status === 'pending'
                        ? 'border-yellow-200 hover:border-yellow-400'
                        : achievement.status === 'approved'
                        ? 'border-green-200 hover:border-green-400'
                        : 'border-red-200 hover:border-red-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-sm px-3 py-1 rounded-full font-bold uppercase tracking-wide ${
                         achievement.status === 'pending'
                         ? 'bg-yellow-100 text-yellow-800'
                         : achievement.status === 'approved'
                         ? 'bg-green-100 text-green-800'
                         : 'bg-red-100 text-red-800'
                      }`}>
                        {achievement.status}
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        {new Date(achievement.submittedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 group-hover:text-[#001a4d] transition-colors">{achievement.title}</h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                       <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">👤</div>
                       <p className="text-sm font-medium text-gray-600 truncate">{achievement.studentName}</p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-100 text-xs font-medium text-gray-500">
                      <div className="flex justify-between">
                        <span>Category</span>
                        <span className="text-gray-900">{achievement.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Department</span>
                        <span className="text-gray-900 truncate max-w-[120px]">{achievement.studentDepartment || achievement.department}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {achievements.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                  <div className="text-6xl mb-4 grayscale">📭</div>
                  <p className="text-xl font-bold text-gray-800">No achievements found</p>
                  <p className="text-gray-500">Different filters might help</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
