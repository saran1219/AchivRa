'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import { adminService } from '@/services/adminService';
import { notificationService } from '@/services/notificationService';
import { AchievementStatus } from '@/types';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

export const FacultyAchievementUploadComponent = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    studentEmail: '',
    title: '',
    description: '',
    category: '',
    organizationName: '',
    eventDate: '',
    tags: '' as string,
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    loadStudentsAndCategories();
  }, []);

  const loadStudentsAndCategories = async () => {
    try {
      // Load categories
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
      addToast(`✓ File selected: ${selectedFile.name}`, 'success');
      
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
    
    if (!formData.studentId || !formData.title || !formData.category || !file) {
      addToast('Please fill all required fields and select a file', 'error');
      return;
    }

    if (!user?.department) {
      addToast('Your department is not set', 'error');
      return;
    }

    setLoading(true);

    try {
      // For faculty uploaded achievements, approve them directly
      const achievementId = await achievementService.createAchievement(
        formData.studentId,
        formData.studentEmail,
        formData.studentName,
        formData.title,
        formData.description,
        formData.category,
        formData.organizationName,
        new Date(formData.eventDate),
        user.department,
        formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      );

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upload certificate
      await achievementService.uploadCertificate(achievementId, formData.studentId, file);

      // Automatically approve faculty-uploaded achievements
      await achievementService.updateAchievementStatus(
        achievementId,
        AchievementStatus.APPROVED,
        'Achievement uploaded and approved by faculty',
        user.id,
        user.name
      );

      // Send notification to student
      await notificationService.createNotification(
        formData.studentId,
        `🎉 Faculty ${user.name} has added a new achievement: "${formData.title}" to your profile and it's already APPROVED!`,
        'approval',
        achievementId
      );

      addToast('✓ Achievement uploaded and approved successfully!', 'success');
      
      // Reset form
      setFormData({
        studentId: '',
        studentName: '',
        studentEmail: '',
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
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      addToast(errorMsg, 'error');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-8">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 space-y-3 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-slide-in-right px-6 py-4 rounded-lg shadow-lg text-white font-semibold max-w-sm ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-orange-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">📚 Upload Achievement for Student</h1>
            <p className="text-orange-100">Add and approve achievements for your department students</p>
          </div>

          {/* Department Info */}
          <div className="bg-orange-50 p-4 mx-8 mt-6 rounded-lg border-l-4 border-orange-600">
            <p className="text-sm text-orange-800">
              <span className="font-bold">Your Department: </span>{user?.department}
              <br />
              <span className="text-xs text-orange-600">Achievements added by you will be automatically approved and appear in student's "My Achievements"</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Student Selection */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4">👨‍🎓 Select Student</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Student Email *</label>
                  <input
                    type="email"
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({...formData, studentEmail: e.target.value})}
                    placeholder="Enter student email (from your department)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    title="Student email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Student Full Name *</label>
                  <input
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                    placeholder="Enter student full name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                    title="Student full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Student ID (Firebase UID) *</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    placeholder="Firebase User ID of the student"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-xs"
                  />
                  <p className="text-xs text-gray-500 mt-2">💡 You can find this in the student's profile</p>
                </div>
              </div>
            </div>

            {/* Achievement Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3">Achievement Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Best Project Award"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3">Category *</label>
                <select
                  aria-label="Achievement category"
                  title="Select achievement category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the achievement..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Organization Name *</label>
                <input
                  type="text"
                  required                  title="Organization or event name"                  value={formData.organizationName}
                  onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                  placeholder="e.g., IEEE, Company, University"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Event Date *</label>
                <input
                  type="date"
                  required
                  title="Event date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Certificate Upload */}
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <label className="block text-sm font-bold text-gray-700 mb-4">Certificate (PDF/Image) *</label>
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <span className="text-4xl">📄</span>
                  <p className="text-gray-700 font-semibold mt-2">Click to upload certificate</p>
                  <p className="text-sm text-gray-500">PNG, JPG, PDF (max 10MB)</p>
                </label>
              </div>
              {file && (
                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
                  <p className="text-sm text-green-800">✓ File selected: {file.name}</p>
                </div>
              )}
              {preview && (
                <div className="mt-4">
                  <img src={preview} alt="Preview" className="max-h-40 rounded border-2 border-blue-300" />
                </div>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Uploading...</span>
                  <span className="text-sm font-semibold text-gray-700">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-3">
                {/* @ts-ignore - CSS custom properties require inline styles for dynamic values */}
                {/* eslint-disable-next-line */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all progress-bar progress-bar-gradient" style={{'--progress-width': `${uploadProgress}%`} as React.CSSProperties}></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading & Approving...
                </>
              ) : (
                <>
                  ✓ Upload & Auto-Approve for Student
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
