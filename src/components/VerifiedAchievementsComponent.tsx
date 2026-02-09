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

    // Search filter
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
    <div className="min-h-screen bg-[#FEFACD]">
      {/* Toast Notifications */}
      <div className="fixed top-20 right-6 space-y-3 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-slide-in-right px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium max-w-xs transition-all duration-300 ${
              toast.type === 'success' ? 'bg-emerald-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-amber-500' :
              'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#5F4A8B] mb-2">✅ Verified Achievements</h1>
          <p className="text-gray-600 text-sm">Achievements you have approved or rejected</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-[#5F4A8B]/10 p-4 mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5F4A8B] focus:ring-2 focus:ring-[#5F4A8B]/10 text-sm transition"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {(['newest', 'oldest'] as const).map(order => (
                <button
                  key={order}
                  onClick={() => setSortOrder(order)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortOrder === order
                      ? 'bg-[#5F4A8B] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {order === 'newest' ? '📅 Newest' : '📅 Oldest'}
                </button>
              ))}
              <button
                onClick={() => setShowAllModal(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all"
              >
                📊 View All Past Achievements
              </button>
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {getFilteredAndSortedAchievements().length} results
            </span>
          </div>
        </div>

        {/* Master-Detail Layout - Horizontal Scrolling */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Master List - Horizontal Scrolling */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm border border-[#5F4A8B]/10 overflow-hidden flex flex-col h-[600px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#5F4A8B] border-t-transparent"></div>
                </div>
              ) : getFilteredAndSortedAchievements().length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-gray-600 text-sm">{searchTerm ? 'No matches found' : 'No verified items'}</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <div className="flex gap-2 p-3 min-w-min">
                    {getFilteredAndSortedAchievements().map((achievement) => (
                      <button
                        key={achievement.id}
                        onClick={() => setSelectedAchievement(achievement)}
                        className={`flex-shrink-0 w-48 text-left p-3 rounded-lg transition-all duration-300 border-2 min-h-[120px] flex flex-col ${
                          selectedAchievement?.id === achievement.id
                            ? 'bg-[#5F4A8B] text-white border-[#5F4A8B] shadow-md'
                            : 'bg-gray-50 text-gray-900 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-2 h-full">
                          <span className="text-xl flex-shrink-0">
                            {achievement.status === 'approved' ? '✅' : '❌'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm line-clamp-2">{achievement.title}</p>
                            <p className={`text-xs mt-2 ${selectedAchievement?.id === achievement.id ? 'opacity-80' : 'text-gray-600'}`}>
                              {achievement.studentName}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="w-full lg:w-2/3">
            {selectedAchievement ? (
              <div className="bg-white rounded-lg shadow-sm border border-[#5F4A8B]/10 overflow-hidden flex flex-col h-[600px]">
                {/* Header */}
                <div className={`bg-gradient-to-r ${
                  selectedAchievement.status === 'approved'
                    ? 'from-emerald-500 to-teal-600'
                    : 'from-red-500 to-rose-600'
                } p-4 text-white flex-shrink-0`}>
                  <h2 className="font-bold text-sm">{selectedAchievement.title}</h2>
                  <p className="text-xs opacity-90 mt-1">{selectedAchievement.studentName}</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Student Info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Student</p>
                    <div className="text-sm space-y-1">
                      <p className="text-gray-700">{selectedAchievement.studentEmail}</p>
                      <div className="inline-block px-2 py-1 bg-[#5F4A8B]/10 text-[#5F4A8B] rounded text-xs font-medium">
                        {selectedAchievement.studentDepartment || selectedAchievement.department}
                      </div>
                    </div>
                  </div>

                  {/* Achievement Details */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Achievement</p>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-gray-600">Category: </span>
                        <span className="font-medium">{selectedAchievement.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Organization: </span>
                        <span className="font-medium">{selectedAchievement.organizationName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Date: </span>
                        <span className="font-medium">{new Date(selectedAchievement.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-gray-600 text-xs mb-1">Description:</p>
                        <p className="text-gray-700 text-xs">{selectedAchievement.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Info */}
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      {selectedAchievement.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </p>
                    {selectedAchievement.verifiedByName && (
                      <p className="text-xs text-gray-600">By: {selectedAchievement.verifiedByName}</p>
                    )}
                    {selectedAchievement.remarks && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Remarks:</p>
                        <p className="text-xs text-gray-600">{selectedAchievement.remarks}</p>
                      </div>
                    )}
                  </div>

                  {/* Certificate */}
                  {selectedAchievement.certificateUrl && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Certificate</p>
                      {selectedAchievement.certificateUrl.includes('.pdf') ? (
                        <a
                          href={selectedAchievement.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#5F4A8B] hover:underline font-medium"
                        >
                          📥 Download PDF
                        </a>
                      ) : (
                        <img
                          src={selectedAchievement.certificateUrl}
                          alt="Certificate"
                          className="max-h-24 rounded border border-[#5F4A8B]/20"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-[#5F4A8B]/10 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">👈</div>
                  <p className="text-gray-600 text-sm">Select an achievement to view</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* All Past Achievements Modal */}
        {showAllModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#5F4A8B] to-purple-600 text-white p-6 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">📊 All Past Achievements</h2>
                    <p className="text-purple-100 text-sm mt-1">Total: {achievements.length} achievements</p>
                  </div>
                  <button
                    onClick={() => setShowAllModal(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      onClick={() => {
                        setSelectedAchievement(achievement);
                        setShowAllModal(false);
                      }}
                      className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4 hover:border-[#5F4A8B] hover:shadow-lg transition cursor-pointer"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <span className="text-2xl flex-shrink-0">
                          {achievement.status === 'approved' ? '✅' : '❌'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{achievement.title}</h3>
                          <p className="text-xs text-gray-600 mt-1">{achievement.studentName}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-3 text-xs text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Category:</span>
                          <span className="text-gray-600">{achievement.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Organization:</span>
                          <span className="text-gray-600 truncate">{achievement.organizationName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Date:</span>
                          <span className="text-gray-600">{new Date(achievement.eventDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          achievement.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {achievement.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {achievements.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="text-gray-600 text-lg">No achievements found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
