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

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto animate-fade-in border border-white/20 mb-12">
          <div className="mb-8 border-b border-gray-100 pb-6">
            <h1 className="text-3xl font-bold text-[#001a4d] mb-2 flex items-center gap-3">
              <span>📜</span> Submit Achievement
            </h1>
            <p className="text-gray-500 text-lg">Upload your certificate for faculty verification</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Title + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#001a4d] mb-2 uppercase tracking-wide">Achievement Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Best Project Award"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#001a4d] focus:ring-0 text-gray-700 transition-all font-medium bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001a4d] mb-2 uppercase tracking-wide">Category *</label>
                <div className="relative">
                  <select
                    aria-label="Achievement category"
                    title="Select achievement category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#001a4d] focus:ring-0 text-gray-700 transition-all font-medium bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Organization + Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#001a4d] mb-2 uppercase tracking-wide">Organization/Event *</label>
                <input
                  type="text"
                  required
                  title="Organization or event name"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                  placeholder="e.g., IEEE, Company, Hackathon"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#001a4d] focus:ring-0 text-gray-700 transition-all font-medium bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#001a4d] mb-2 uppercase tracking-wide">Date *</label>
                <input
                  type="date"
                  required
                  title="Event date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#001a4d] focus:ring-0 text-gray-700 transition-all font-medium bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Full Width: Description */}
            <div>
              <label className="block text-sm font-bold text-[#001a4d] mb-2 uppercase tracking-wide">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your achievement briefly..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#001a4d] focus:ring-0 text-gray-700 transition-all font-medium bg-gray-50 focus:bg-white resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="bg-blue-50/50 p-8 rounded-2xl border-2 border-dashed border-blue-200 hover:border-[#001a4d] transition-all group cursor-pointer text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="cert-file-input"
              />
              <label htmlFor="cert-file-input" className="cursor-pointer block w-full h-full">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {file ? '📄' : '📤'}
                </div>
                <p className="text-lg font-bold text-[#001a4d] mb-1 group-hover:text-blue-700 transition-colors">
                  {file ? 'Change File' : 'Upload Certificate'}
                </p>
                <p className="text-sm text-gray-500 font-medium">PNG, JPG, PDF (max 10MB)</p>
              </label>
              
              {file && (
                <div className="mt-6 p-4 bg-white border border-green-200 rounded-xl shadow-sm flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <div className="text-left">
                      <p className="font-bold text-gray-800 text-sm truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setFile(null); setPreview(''); }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {preview && (
                <div className="mt-4">
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg border-4 border-white shadow-lg transform rotate-2" />
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#001a4d] uppercase tracking-wide">Uploading...</span>
                  <span className="text-xs font-bold text-[#001a4d]">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-yellow-400 h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                    style={{width: `${uploadProgress}%`}}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-yellow-400 text-[#001a4d] rounded-xl font-bold text-lg hover:bg-yellow-300 hover:shadow-xl hover:shadow-yellow-400/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center gap-3 w-full md:w-auto justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-[#001a4d] border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>🚀</span> Submit for Verification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Submitted Achievements */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
             <span>📜</span> Your Submission History
          </h2>
          
          {submittedLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          ) : submittedAchievements.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center border border-white/20 text-white">
              <div className="text-5xl mb-4 opacity-80">📭</div>
              <h3 className="text-xl font-bold mb-2">No Submissions Yet</h3>
              <p className="text-blue-100 opacity-80">Submit your first achievement above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submittedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white/95 backdrop-blur-sm rounded-xl border border-white/20 p-5 hover:bg-white hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-default group"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">
                           {achievement.status === 'approved' && '✅'}
                           {achievement.status === 'rejected' && '❌'}
                           {achievement.status === 'pending' && '⏳'}
                        </span>
                        <h3 className="font-bold text-[#001a4d] text-base truncate group-hover:text-blue-700 transition-colors">{achievement.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap text-sm font-medium pl-9">
                        <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 uppercase tracking-wide">{achievement.category}</span>
                        <span className="text-gray-500">🏢 {achievement.organizationName}</span>
                        <span className="text-gray-500">📅 {new Date(achievement.eventDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0 self-center">
                      {achievement.status === 'approved' && (
                        <div className="px-4 py-1.5 bg-green-100 text-green-800 rounded-lg text-xs font-bold border border-green-200">
                          Verified
                        </div>
                      )}
                      {achievement.status === 'pending' && (
                        <div className="px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold border border-yellow-200">
                          In Review
                        </div>
                      )}
                      {achievement.status === 'rejected' && (
                        <div className="px-4 py-1.5 bg-red-100 text-red-800 rounded-lg text-xs font-bold border border-red-200">
                          Rejected
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remarks */}
                  {achievement.remarks && (
                    <div className="mt-4 pt-3 border-t border-gray-100 pl-9">
                      <p className="text-xs font-bold text-[#001a4d] uppercase tracking-wide mb-1 opacity-70">Faculty Feedback</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{achievement.remarks}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
         @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};
