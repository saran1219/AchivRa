'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import { adminService } from '@/services/adminService';
import { notificationService } from '@/services/notificationService';
import { Achievement } from '@/types';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

export const StudentSubmitCertificateComponent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [submittedAchievements, setSubmittedAchievements] = useState<Achievement[]>([]);
  const [submittedLoading, setSubmittedLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    organizationName: '',
    eventDate: '',
    tags: '' as string,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  // Load submitted achievements when user is available
  useEffect(() => {
    if (user?.id) {
      loadSubmittedAchievements();
    }
  }, [user?.id]);

  const loadSubmittedAchievements = async () => {
    try {
      if (user?.id) {
        const data = await achievementService.getStudentAchievements(user.id);
        // Show all achievements (pending, approved, rejected) to show submission history
        setSubmittedAchievements(data);
      }
    } catch (error) {
      console.error('Error loading submitted achievements:', error);
    } finally {
      setSubmittedLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      let cats = await adminService.getCategories();
      if (cats.length === 0) {
        const defaultCategories = [
          { name: 'Hackathon', slug: 'hackathon', description: 'Hackathon participation and wins' },
          { name: 'Paper Presentation', slug: 'paper-presentation', description: 'Academic paper presentations' },
          { name: 'Coding Competition', slug: 'coding-competition', description: 'Programming and coding competitions' },
          { name: 'Technical Workshop', slug: 'technical-workshop', description: 'Technical workshops and seminars' },
          { name: 'Project Work', slug: 'project-work', description: 'Software/Hardware projects' },
          { name: 'Research', slug: 'research', description: 'Research publications and findings' },
          { name: 'Certification', slug: 'certification', description: 'Professional certifications' },
          { name: 'Sports', slug: 'sports', description: 'Sports achievements and trophies' },
          { name: 'Cultural Event', slug: 'cultural-event', description: 'Cultural events and performances' },
          { name: 'Leadership', slug: 'leadership', description: 'Leadership roles and responsibilities' },
          { name: 'Internship', slug: 'internship', description: 'Internship experiences' },
          { name: 'Other', slug: 'other', description: 'Other achievements' },
        ];
        
        for (const cat of defaultCategories) {
          await adminService.addCategory(cat.name, cat.slug, cat.description);
        }
        cats = await adminService.getCategories();
      }
      setCategories(cats.map(cat => cat.name));
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories(['Hackathon', 'Paper Presentation', 'Coding Competition', 'Technical Workshop', 'Project Work', 'Research', 'Certification', 'Sports', 'Cultural Event', 'Leadership', 'Internship', 'Other']);
    }
  };

  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      addToast(`✓ Certificate selected: ${selectedFile.name}`, 'success');
      
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreview(event.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.organizationName || !formData.eventDate || !file) {
      addToast('Please fill all required fields and select a certificate file', 'error');
      return;
    }

    if (!user || !user.id || !user.email) {
      addToast('User authentication incomplete. Please refresh and try again.', 'error');
      return;
    }

    setLoading(true);

    try {
      addToast('📤 Submitting certificate...', 'info');
      
      // Use user name or fallback to 'Student'
      const studentName = user.name || 'Student';
      const achievementId = await achievementService.createAchievement(
        user.id,
        user.email,
        studentName,
        formData.title,
        formData.description,
        formData.category,
        formData.organizationName,
        new Date(formData.eventDate),
        user.department || '',
        formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      );

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upload certificate
      addToast('📎 Uploading certificate file...', 'info');
      await achievementService.uploadCertificate(achievementId, user.id, file);

      // Send notification to faculty in same department
      addToast('✓ Certificate submitted successfully!', 'success');
      
      // Reload submitted achievements to show the new submission
      await loadSubmittedAchievements();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        organizationName: '',
        eventDate: '',
        tags: '',
      });
      setFile(null);
      setPreview('');
      setUploadProgress(0);

      // Show success message
      setTimeout(() => {
        addToast('⏳ Pending faculty review. You will be notified once approved!', 'info');
      }, 1000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Submission failed';
      addToast(errorMsg, 'error');
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-[#5F4A8B]/10 mb-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#5F4A8B] mb-2">📜 Submit Achievement</h1>
            <p className="text-gray-600 text-sm">Upload your certificate for faculty verification</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Title + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#5F4A8B] mb-2">Achievement Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Best Project Award"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5F4A8B] focus:ring-2 focus:ring-[#5F4A8B]/10 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5F4A8B] mb-2">Category *</label>
                <select
                  aria-label="Achievement category"
                  title="Select achievement category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5F4A8B] focus:ring-2 focus:ring-[#5F4A8B]/10 transition text-sm"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Organization + Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#5F4A8B] mb-2">Organization/Event *</label>
                <input
                  type="text"
                  required
                  title="Organization or event name"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                  placeholder="e.g., IEEE, Company, Hackathon"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5F4A8B] focus:ring-2 focus:ring-[#5F4A8B]/10 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5F4A8B] mb-2">Date *</label>
                <input
                  type="date"
                  required
                  title="Event date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5F4A8B] focus:ring-2 focus:ring-[#5F4A8B]/10 transition text-sm"
                />
              </div>
            </div>

            {/* Full Width: Description */}
            <div>
              <label className="block text-sm font-semibold text-[#5F4A8B] mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your achievement briefly..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#5F4A8B] focus:ring-2 focus:ring-[#5F4A8B]/10 transition text-sm resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="bg-[#5F4A8B]/5 p-6 rounded-lg border-2 border-dashed border-[#5F4A8B]/30 hover:border-[#5F4A8B]/50 transition-colors">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="cert-file-input"
              />
              <label htmlFor="cert-file-input" className="cursor-pointer block text-center">
                <div className="text-3xl mb-3">📄</div>
                <p className="text-sm font-semibold text-[#5F4A8B] mb-1">Click to upload certificate</p>
                <p className="text-xs text-gray-600">PNG, JPG, PDF (max 10MB)</p>
              </label>
              {file && (
                <div className="mt-4 p-3 text-sm text-emerald-700 bg-emerald-50/50 border border-emerald-200 rounded">
                  ✓ {file.name}
                </div>
              )}
              {preview && (
                <div className="mt-4">
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded border border-[#5F4A8B]/20" />
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-gray-700">Uploading...</span>
                  <span className="text-xs font-semibold text-gray-700">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  {/* @ts-ignore - CSS custom properties require inline styles for dynamic values */}
                  {/* eslint-disable-next-line */}
                  <div className="bg-[#5F4A8B] h-2 rounded-full transition-all duration-300 progress-bar" style={{'--progress-width': `${uploadProgress}%`} as React.CSSProperties}></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#5F4A8B] text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-[#5F4A8B]/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>📤 Submit</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Submitted Achievements */}
        <div>
          <h2 className="text-2xl font-bold text-[#5F4A8B] mb-4">📜 Your Submissions</h2>
          
          {submittedLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#5F4A8B] border-t-transparent"></div>
            </div>
          ) : submittedAchievements.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-[#5F4A8B]/10">
              <div className="text-4xl mb-3">📭</div>
              <h3 className="text-lg font-semibold text-gray-800">No Submissions Yet</h3>
              <p className="text-gray-600 text-sm mt-2">Submit your first achievement above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submittedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white rounded-lg shadow-sm border border-[#5F4A8B]/10 p-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#5F4A8B] text-sm truncate">{achievement.title}</h3>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{achievement.category}</span>
                        <span className="text-xs text-gray-600">🏢 {achievement.organizationName}</span>
                        <span className="text-xs text-gray-600">📅 {new Date(achievement.eventDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {achievement.status === 'approved' && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                          ✅ Approved
                        </div>
                      )}
                      {achievement.status === 'pending' && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                          ⏳ Pending
                        </div>
                      )}
                      {achievement.status === 'rejected' && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          ❌ Rejected
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remarks */}
                  {achievement.remarks && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                      <p className="font-semibold text-gray-700 mb-1">Feedback:</p>
                      <p className="text-gray-600">{achievement.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
