'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import { adminService } from '@/services/adminService';
import { notificationService } from '@/services/notificationService';
import { Achievement, SkillGroup } from '@/types';

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
  const [files, setFiles] = useState<File[]>([]);
  const [submittedAchievements, setSubmittedAchievements] = useState<Achievement[]>([]);
  const [submittedLoading, setSubmittedLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    organizationName: '',
    eventDate: '',
    tags: '' as string,
    skillGroup: SkillGroup.TECHNICAL,
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
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      addToast(`✓ ${newFiles.length} file(s) added`, 'success');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.organizationName || !formData.eventDate) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    if (files.length === 0) {
      addToast('Please select at least one certificate file', 'error');
      return;
    }

    if (!user || !user.id || !user.email) {
      addToast('User authentication incomplete. Please refresh and try again.', 'error');
      return;
    }

    setLoading(true);

    try {
      addToast('📤 Submitting achievement...', 'info');
      
      // Use user name or fallback to 'Student'
      const studentName = user.name || 'Student';
      
      // First, create the achievement record
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
        formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        [],
        [],
        formData.skillGroup
      );

      // Simulate initial progress
      setUploadProgress(10);

      // Upload certificates
      addToast(`📎 Uploading ${files.length} file(s)...`, 'info');
      await achievementService.uploadCertificates(achievementId, user.id, files, (progress) => {
        setUploadProgress(Math.round(progress));
      });
      
      setUploadProgress(100);

      // Send notification to verification team
      await notificationService.addNotification({
        recipientId: 'all_verification_team',
        type: 'submission',
        title: 'New Achievement Submitted',
        message: `New achievement submitted by ${studentName} for ${formData.category}`,
      });

      addToast('✓ Achievement submitted successfully!', 'success');
      
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
        skillGroup: SkillGroup.TECHNICAL,
      });
      setFiles([]);
      setUploadProgress(0);

      // Show success message
      setTimeout(() => {
        addToast('⏳ Pending verification. You will be notified once approved!', 'info');
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

            <div>
              <label className="block text-sm font-bold text-[#001a4d] mb-2 uppercase tracking-wide">Skill group *</label>
              <select
                required
                aria-label="Skill group"
                title="Skill group for categorization"
                value={formData.skillGroup}
                onChange={(e) => setFormData({ ...formData, skillGroup: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#001a4d] focus:ring-0 text-gray-700 transition-all font-medium bg-gray-50 focus:bg-white appearance-none cursor-pointer"
              >
                <option value={SkillGroup.TECHNICAL}>Technical</option>
                <option value={SkillGroup.PROFESSIONAL}>Professional</option>
                <option value={SkillGroup.SOFT_SKILLS}>Soft Skills</option>
              </select>
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
            <div className="bg-blue-50/50 p-8 rounded-2xl border-2 border-dashed border-blue-200 hover:border-[#001a4d] transition-all group cursor-pointer text-center relative">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="cert-file-input"
              />
              <label htmlFor="cert-file-input" className="cursor-pointer block w-full h-full">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-md mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {files.length > 0 ? '📚' : '📤'}
                </div>
                <p className="text-lg font-bold text-[#001a4d] mb-1 group-hover:text-blue-700 transition-colors">
                  {files.length > 0 ? 'Add More Files' : 'Upload Certificates'}
                </p>
                <p className="text-sm text-gray-500 font-medium">PNG, JPG, PDF (Multiple files allowed)</p>
              </label>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-sm font-bold text-[#001a4d] px-1">Selected Files ({files.length})</p>
                {files.map((f, index) => (
                  <div key={index} className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-2xl bg-gray-100 w-10 h-10 flex items-center justify-center rounded-lg">
                        {f.type.includes('pdf') ? '📄' : '🖼️'}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{f.name}</p>
                        <p className="text-xs text-gray-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFile(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

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
                    className={`rounded-xl p-5 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-default group border-2 ${
                      achievement.status === 'approved'
                        ? 'bg-green-50 border-green-500' // Verified Style
                        : achievement.status === 'rejected'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-white/95 backdrop-blur-sm border-white/20 hover:bg-white'
                    }`}
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
                          {achievement.status === 'approved' && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold border border-green-200">
                              ✔ Verified
                            </span>
                          )}
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
                          <div className="px-4 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-200 shadow-sm">
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
                      <p className="text-xs font-bold text-[#001a4d] uppercase tracking-wide mb-1 opacity-70">Faculty remarks</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{achievement.remarks}"</p>
                    </div>
                  )}

                  {/* Files List */}
                  {((achievement.fileUrls?.length ?? 0) > 0) && (
                    <div className="mt-4 pt-3 border-t border-gray-100 pl-9">
                      <p className="text-xs font-bold text-[#001a4d] uppercase tracking-wider mb-2 opacity-70">Submitted Files</p>
                      <div className="flex flex-wrap gap-2">
                        {achievement.fileUrls!.map((url, i) => {
                           const fileName = achievement.fileNames?.[i] || `File ${i+1}`;
                           const isPdf = url.toLowerCase().includes('.pdf') || fileName.toLowerCase().includes('.pdf');
                           return (
                             <a 
                               key={i}
                               href={url}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                             >
                                <span className="text-lg">{isPdf ? '📄' : '🖼️'}</span>
                                <span className="truncate max-w-[150px] font-medium text-gray-700 group-hover:text-blue-700">{fileName}</span>
                             </a>
                           );
                        })}
                      </div>
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
