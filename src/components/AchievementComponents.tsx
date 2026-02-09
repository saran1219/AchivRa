'use client';

import React, { useState, useEffect } from 'react';
import { Achievement } from '@/types';
import { achievementService } from '@/services/achievementService';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { Toast, ToastType } from './Toast';

export const AchievementForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [certificate, setCertificate] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [toasts, setToasts] = useState<Array<{ message: string; type: ToastType }>>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    setCategories([
      { id: '1', name: '🎤 Conference' },
      { id: '2', name: '🏆 Competition' },
      { id: '3', name: '📚 Workshop' },
      { id: '4', name: '📜 Certification' },
    ]);
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!category) errors.category = 'Category is required';
    if (!organizationName.trim()) errors.organizationName = 'Organization name is required';
    if (!eventDate) errors.eventDate = 'Event date is required';
    if (!certificate) errors.certificate = 'Certificate file is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificate(file);
      setValidationErrors(prev => ({ ...prev, certificate: '' }));
      
      // Show file preview info
      addToast(`📎 File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`, 'info');
      
      // Show preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setCertificatePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) {
      addToast('Please fix the errors above', 'error');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      addToast('📤 Uploading achievement...', 'info');
      
      const achievementId = await achievementService.createAchievement(
        user.id,
        user.email,
        user.name,
        title,
        description,
        category,
        organizationName,
        new Date(eventDate),
        user.department || '',
        []
      );

      if (certificate) {
        addToast('📎 Uploading certificate...', 'info');
        await achievementService.uploadCertificate(achievementId, user.id, certificate);
      }

      await notificationService.createNotification(
        user.id,
        'achievement_submitted',
        '✓ Achievement Submitted',
        'Your achievement has been submitted for verification'
      );

      setSuccess(true);
      addToast('✓ Achievement uploaded successfully!', 'success');
      
      // Reset form
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setCategory('');
        setOrganizationName('');
        setEventDate('');
        setCertificate(null);
        setCertificatePreview('');
        onSuccess();
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload achievement';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToast = (message: string, type: ToastType) => {
    setToasts(prev => [...prev, { message, type }]);
    setTimeout(() => setToasts(prev => prev.slice(1)), 5000);
  };

  return (
    <>
      <div className="fixed top-6 right-6 space-y-3 z-50">
        {toasts.map((toast, idx) => (
          <Toast key={idx} message={toast.message} type={toast.type} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg max-w-2xl border-2 border-orange-200">
        <h2 className="text-3xl font-bold mb-2">📤 Upload Achievement</h2>
        <p className="text-gray-600 mb-6">Share your accomplishments with us</p>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
            <span className="text-xl">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-start gap-3">
            <span className="text-xl">✓</span>
            <span>Great! Your achievement is being reviewed. You'll be notified once verified.</span>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📌 Achievement Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationErrors.title) setValidationErrors(prev => ({ ...prev, title: '' }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                validationErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-orange-500'
              }`}
              placeholder="e.g., Won First Prize in Debate Competition"
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">✕ {validationErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Description</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (validationErrors.description) setValidationErrors(prev => ({ ...prev, description: '' }));
              }}
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                validationErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-orange-500'
              }`}
              placeholder="Tell us more about this achievement..."
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1">✕ {validationErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📂 Category</label>
              <select
                aria-label="Achievement category"
                title="Select achievement category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (validationErrors.category) setValidationErrors(prev => ({ ...prev, category: '' }));
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                  validationErrors.category ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-orange-500'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="text-red-500 text-sm mt-1">✕ {validationErrors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🏢 Organization</label>
              <input
                type="text"
                value={organizationName}
                onChange={(e) => {
                  setOrganizationName(e.target.value);
                  if (validationErrors.organizationName) setValidationErrors(prev => ({ ...prev, organizationName: '' }));
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                  validationErrors.organizationName ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-orange-500'
                }`}
                placeholder="e.g., Tech Society"
              />
              {validationErrors.organizationName && (
                <p className="text-red-500 text-sm mt-1">✕ {validationErrors.organizationName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Event Date</label>
            <input
              type="date"
              title="Event date"
              value={eventDate}
              onChange={(e) => {
                setEventDate(e.target.value);
                if (validationErrors.eventDate) setValidationErrors(prev => ({ ...prev, eventDate: '' }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                validationErrors.eventDate ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-orange-500'
              }`}
            />
            {validationErrors.eventDate && (
              <p className="text-red-500 text-sm mt-1">✕ {validationErrors.eventDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📄 Certificate (PDF/Image)</label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              validationErrors.certificate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-orange-500'
            }`}>
              <input
                type="file"
                onChange={handleCertificateChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="certificate-input"
              />
              <label htmlFor="certificate-input" className="cursor-pointer">
                {certificate ? (
                  <div>
                    <p className="text-green-600 font-semibold">✓ File selected</p>
                    <p className="text-sm text-gray-600">{certificate.name}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 font-semibold">📎 Drag and drop your certificate</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                    <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                )}
              </label>
            </div>
            {certificatePreview && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                <img src={certificatePreview} alt="Certificate preview" className="max-h-48 rounded border" />
              </div>
            )}
            {validationErrors.certificate && (
              <p className="text-red-500 text-sm mt-2">✕ {validationErrors.certificate}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition font-semibold flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Uploading...' : success ? '✓ Uploaded!' : '📤 Submit Achievement'}
          </button>
        </div>
      </form>
    </>
  );
};

export const AchievementList = ({ achievements, showCertificate = false }: { achievements: Achievement[]; showCertificate?: boolean }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'rejected':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'rejected':
        return '✕';
      case 'pending':
        return '⏳';
      default:
        return '•';
    }
  };

  return (
    <div className="space-y-4">
      {achievements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">📭 No achievements yet</p>
          <p className="text-gray-400 text-sm mt-2">Start by uploading your first achievement!</p>
        </div>
      ) : (
        achievements.map((achievement) => (
          <div key={achievement.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{achievement.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{achievement.description}</p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {achievement.category}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {achievement.organizationName}
                  </span>
                  <span className="text-gray-500 text-sm px-3 py-1">
                    📅 {new Date(achievement.eventDate).toLocaleDateString()}
                  </span>
                </div>

                {achievement.remarks && (
                  <div className="mt-3 bg-gray-50 border-l-4 border-orange-500 p-3 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>💬 Remarks:</strong> {achievement.remarks}
                    </p>
                  </div>
                )}

                {/* Certificate/Document Section */}
                {showCertificate && achievement.status === 'approved' && achievement.certificateUrl && (
                  <div className="mt-4">
                    <button
                      onClick={() => setExpandedId(expandedId === achievement.id ? null : achievement.id)}
                      className="flex items-center gap-2 text-orange-600 hover:text-orange-800 font-semibold text-sm"
                    >
                      {expandedId === achievement.id ? '▼' : '▶'} 📄 View Certificate ({achievement.certificateFileName})
                    </button>
                    
                    {expandedId === achievement.id && (
                      <div className="mt-3 bg-gray-50 border border-gray-300 rounded-lg p-4">
                        {achievement.certificateFileName?.toLowerCase().endsWith('.pdf') ? (
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700 mb-2">📄 PDF Certificate</p>
                              <p className="text-xs text-gray-500">{achievement.certificateFileName}</p>
                              {achievement.certificateSize && (
                                <p className="text-xs text-gray-500">Size: {(achievement.certificateSize / 1024).toFixed(2)} KB</p>
                              )}
                            </div>
                            <a
                              href={achievement.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                            >
                              Download
                            </a>
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
                            <img 
                              src={achievement.certificateUrl} 
                              alt="Certificate" 
                              className="w-full h-auto object-contain max-h-96"
                            />
                            <div className="p-3 bg-gray-100 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-gray-700">{achievement.certificateFileName}</p>
                                {achievement.certificateSize && (
                                  <p className="text-xs text-gray-500">Size: {(achievement.certificateSize / 1024).toFixed(2)} KB</p>
                                )}
                              </div>
                              <a
                                href={achievement.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm font-semibold"
                              >
                                View
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Verification Info */}
                {achievement.verifiedByName && achievement.verificationDate && (
                  <div className="mt-3 bg-green-50 border-l-4 border-green-500 p-3 rounded">
                    <p className="text-sm text-green-700">
                      <strong>✅ Verified by:</strong> {achievement.verifiedByName} on {new Date(achievement.verificationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className={`px-4 py-2 rounded-lg border-2 font-semibold flex items-center gap-2 whitespace-nowrap ${getStatusColor(achievement.status)}`}>
                <span>{getStatusIcon(achievement.status)}</span>
                <span className="capitalize">{achievement.status}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
