'use client';

import React, { useState, useEffect } from 'react';
import { Achievement } from '@/types';
import { achievementService } from '@/services/achievementService';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { Toast, ToastType } from './Toast';
import QRCode from 'react-qr-code';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Trophy, 
  Building, 
  Calendar, 
  MessageSquare, 
  Download, 
  Eye,
  Award,
  Upload,
  AlertCircle,
  FileBadge
} from 'lucide-react';

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
      { id: '1', name: 'Conference', icon: <MessageSquare size={16} /> },
      { id: '2', name: 'Competition', icon: <Trophy size={16} /> },
      { id: '3', name: 'Workshop', icon: <FileText size={16} /> },
      { id: '4', name: 'Certification', icon: <FileBadge size={16} /> },
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
        await achievementService.uploadCertificates(achievementId, user.id, [certificate]);
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
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Upload className="text-[#001a4d]" size={28}/> Upload Achievement</h2>
        <p className="text-gray-500 mb-6 text-sm">Share your accomplishments with us for official review.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 flex items-start gap-3 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-6 flex items-start gap-3 text-sm">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <span>Great! Your achievement is being reviewed. You'll be notified once verified.</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Achievement Title</label>
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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Description</label>
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Category</label>
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
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Organization</label>
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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Event Date</label>
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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">Certificate (PDF/Image)</label>
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
                  <div className="flex flex-col items-center">
                    <CheckCircle className="text-green-500 mb-2" size={24} />
                    <p className="text-green-600 font-semibold text-sm">File selected</p>
                    <p className="text-xs text-gray-600 mt-1">{certificate.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FileText className="text-gray-400 mb-2" size={24} />
                    <p className="text-gray-700 font-semibold text-sm">Drag and drop your certificate</p>
                    <p className="text-xs text-gray-500">or click to browse</p>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">PDF, JPG, PNG (Max 10MB)</p>
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
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={14} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={14} className="text-red-600" />;
      case 'pending':
        return <Clock size={14} className="text-yellow-600" />;
      default:
        return <AlertCircle size={14} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-3">
      {achievements.length === 0 ? (
        <div className="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 flex flex-col items-center">
          <FileText className="text-gray-300 mb-3" size={32} />
          <p className="text-gray-500 font-medium text-sm">No achievements yet</p>
          <p className="text-gray-400 text-xs mt-1">Start by uploading your first achievement!</p>
        </div>
      ) : (
        achievements.map((achievement) => (
          <div key={achievement.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              
              {/* Left Side: Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Award size={18} className="text-[#001a4d] shrink-0" />
                  <h3 className="text-base font-bold text-gray-900 truncate" title={achievement.title}>{achievement.title}</h3>
                </div>
                
                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1.5 font-medium bg-gray-100/80 px-2 py-0.5 rounded text-gray-700">
                    <FileBadge size={12} className="text-gray-500" />
                    {achievement.category}
                  </span>
                  <span className="flex items-center gap-1.5 truncate max-w-[150px]" title={achievement.organizationName}>
                    <Building size={12} className="text-gray-400 shrink-0" />
                    <span className="truncate">{achievement.organizationName}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    <Calendar size={12} className="text-gray-400" />
                    {new Date(achievement.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Optional Feedback Row */}
                {achievement.remarks && (
                  <div className="mt-3 flex items-start gap-2 bg-orange-50/50 rounded-lg p-2.5 border border-orange-100/50">
                    <MessageSquare size={14} className="text-orange-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-900 italic line-clamp-2">"{achievement.remarks}"</p>
                  </div>
                )}
                
                {/* File Chip (Bottom Left) */}
                {showCertificate && achievement.certificateUrl && (
                  <div className="mt-3">
                    <button
                      onClick={() => setSelectedAchievement(achievement)}
                      className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors group-hover:border-gray-300"
                    >
                      <FileText size={14} className="text-blue-600" />
                      <span className="truncate max-w-[120px]">{achievement.certificateFileName || 'Document'}</span>
                      <span className="text-gray-400 mx-1">|</span>
                      <span className="text-blue-600 flex items-center gap-1"><Eye size={12} /> View</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side: Status Badge */}
              <div className="flex flex-col md:items-end justify-between shrink-0 gap-3">
                <div className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap shadow-sm ${getStatusColor(achievement.status)}`}>
                  {getStatusIcon(achievement.status)}
                  <span>{achievement.status}</span>
                </div>

                {achievement.status === 'approved' && achievement.verificationDate && (
                  <div className="text-[10px] text-gray-400 text-right space-y-0.5">
                    <p className="uppercase tracking-wider font-semibold text-green-600/70">Verified</p>
                    <p>{new Date(achievement.verificationDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        ))
      )}

      {/* Certificate Viewer Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col my-8 max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#001a4d] to-[#0033a0] p-6 text-white flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1 line-clamp-2 pr-4">{selectedAchievement.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-blue-200">
                  <span className="bg-white/20 px-2 py-0.5 rounded flex items-center gap-1">📍 {selectedAchievement.category}</span>
                  <span className="flex items-center gap-1">🏢 {selectedAchievement.organizationName}</span>
                  <span className="flex items-center gap-1">📅 {new Date(selectedAchievement.eventDate).toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAchievement(null)}
                className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col lg:flex-row gap-6">
              
              {/* Left Column: Embed viewer */}
              <div className="flex-1 bg-gray-200 rounded-xl overflow-hidden border-2 border-gray-300 min-h-[400px] lg:min-h-[600px] flex items-center justify-center relative">
                {selectedAchievement.certificateFileName?.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={`${selectedAchievement.certificateUrl}#toolbar=0`} 
                    className="w-full h-full absolute inset-0"
                    title="Certificate PDF"
                  />
                ) : (
                  <img 
                    src={selectedAchievement.certificateUrl} 
                    alt="Certificate" 
                    className="w-full h-full object-contain absolute inset-0 bg-white"
                  />
                )}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <a 
                    href={selectedAchievement.certificateUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800/80 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-semibold backdrop-blur-md transition-colors shadow-lg flex items-center gap-2"
                  >
                    <Download size={16} /> Download
                  </a>
                </div>
              </div>

              {/* Right Column: Meta & QR Code */}
              <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
                {/* Meta Card */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <div className={`px-4 py-3 rounded-lg border-2 font-bold flex items-center justify-center gap-2 text-lg uppercase tracking-wider ${getStatusColor(selectedAchievement.status)}`}>
                    <span>{getStatusIcon(selectedAchievement.status)}</span>
                    <span className="capitalize">{selectedAchievement.status}</span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Description</span>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedAchievement.description}</p>
                  </div>

                  {selectedAchievement.remarks && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded text-sm text-gray-700">
                      <strong>💬 Remarks:</strong> {selectedAchievement.remarks}
                    </div>
                  )}
                  
                  {selectedAchievement.status === 'approved' && selectedAchievement.verificationDate && (
                    <div className="pt-4 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Verified On</span>
                      <p className="text-sm font-bold text-gray-800">{new Date(selectedAchievement.verificationDate).toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">By {selectedAchievement.verifiedByName || 'Verification Team'}</p>
                    </div>
                  )}
                </div>

                {/* QR Code Validation Card (Only for Approved) */}
                {selectedAchievement.status === 'approved' && (
                  <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm shadow-blue-100/50 flex flex-col items-center text-center">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-4 border-b border-blue-100 w-full pb-2">Digital Verification</span>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm mb-4">
                      <QRCode 
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${selectedAchievement.id}`}
                        size={140}
                        level="H"
                        fgColor="#001a4d"
                      />
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">Scan this code to verify the authenticity of this certificate on the official portal.</p>
                    <div className="bg-gray-50 rounded px-3 py-1.5 font-mono text-xs text-gray-600 border border-gray-200 w-full truncate" title={selectedAchievement.id}>
                      ID: {selectedAchievement.id}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
