'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import { notificationService } from '@/services/notificationService';
import { adminService } from '@/services/adminService';
import { AchievementStatus, UserRole } from '@/types';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

export const StudentUploadComponent = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    organizationName: '',
    eventDate: '',
    tags: '' as string,
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string>('');

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      let cats = await adminService.getCategories();
      
      // If no categories exist, create default ones
      if (cats.length === 0) {
        console.log('No categories found, creating default categories...');
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
        
        // Reload categories
        cats = await adminService.getCategories();
        console.log('Default categories created:', cats.length);
      }
      
      setCategories(cats.map(cat => cat.name));
    } catch (err) {
      console.error('Error loading categories:', err);
      // Fallback to hardcoded categories
      const fallbackCategories = [
        'Hackathon',
        'Paper Presentation',
        'Coding Competition',
        'Technical Workshop',
        'Project Work',
        'Research',
        'Certification',
        'Sports',
        'Cultural Event',
        'Leadership',
        'Internship',
        'Other'
      ];
      setCategories(fallbackCategories);
      addToast('Using default categories', 'info');
    }
  };

  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        addToast('File size must be less than 10MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setFile(selectedFile);
      addToast(`File selected: ${selectedFile.name}`, 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      addToast('Please login first', 'error');
      return;
    }

    if (!file) {
      addToast('Please select a file', 'error');
      return;
    }

    if (!formData.title || !formData.category || !formData.eventDate) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      // Create achievement
      const achievementId = await achievementService.createAchievement(
        user.id,
        user.email,
        user.name,
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
      await achievementService.uploadCertificate(achievementId, user.id, file);

      // Notify faculty members
      const facultyMembers = await adminService.getCategories(); // Get faculty list
      addToast('✓ Achievement uploaded successfully!', 'success');
      
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

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/student/achievements');
      }, 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      addToast(errorMsg, 'error');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 space-y-3 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-slide-in-right px-6 py-4 rounded-lg shadow-lg text-white font-semibold max-w-sm ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">📚 Upload Achievement</h1>
            <p className="text-blue-100">Share your accomplishments and get verified by faculty</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Title and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Achievement Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Best Project Award"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg transition group-hover:border-blue-300"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Category *
                </label>
                <select
                  aria-label="Achievement category"
                  title="Select achievement category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg transition group-hover:border-blue-300"
                >
                  <option value="">Select category...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your achievement in detail..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg transition group-hover:border-blue-300 resize-none"
              />
            </div>

            {/* Organization and Event Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Organization/Event Name
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
                  placeholder="e.g., National Tech Summit 2025"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg transition group-hover:border-blue-300"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  title="Event date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg transition group-hover:border-blue-300"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="e.g., programming, award, hackathon"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:shadow-lg transition group-hover:border-blue-300"
              />
            </div>

            {/* File Upload */}
            <div className="group">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Certificate File * (PDF, PNG, JPG)
              </label>
              <div className="relative">
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="flex items-center justify-center w-full p-8 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition duration-300 group-hover:shadow-lg"
                >
                  {preview ? (
                    <div className="text-center">
                      <img src={preview} alt="Preview" className="max-h-32 mx-auto mb-3 rounded" />
                      <p className="text-green-600 font-semibold">✓ {file?.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-4xl mb-3">📄</div>
                      <p className="text-gray-600 font-semibold">Drop your certificate here</p>
                      <p className="text-gray-400 text-sm">or click to browse</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Progress Bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                {/* @ts-ignore - CSS custom properties require inline styles for dynamic values */}
                {/* eslint-disable-next-line */}
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300 progress-bar"
                  style={{'--progress-width': `${uploadProgress}%`} as React.CSSProperties}
                ></div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg hover:shadow-lg disabled:bg-gray-400 transition transform hover:scale-105 font-bold text-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <span>🚀 Upload Achievement</span>
                </>
              )}
            </button>
          </form>

          {/* Tips Section */}
          <div className="bg-blue-50 border-t-2 border-blue-200 p-8">
            <h3 className="font-bold text-gray-800 mb-4">💡 Tips for Success</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Use a clear, descriptive title for your achievement</li>
              <li>✓ Upload high-quality certificate images or PDF files</li>
              <li>✓ Fill in all required fields for faster verification</li>
              <li>✓ Faculty members will review within 24-48 hours</li>
              <li>✓ You'll receive a notification when your achievement is verified</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
