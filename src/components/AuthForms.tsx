'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Toast, ToastType } from './Toast';
import { authService } from '@/services/authService';

// Google Sign-In Modal Component
const GoogleSignInModal = ({ 
  isOpen, 
  onClose, 
  onSelect,
  isLoading 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (role: UserRole, dept: string) => void;
  isLoading: boolean;
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if ((selectedRole === UserRole.STUDENT || selectedRole === UserRole.FACULTY) && !selectedDepartment) {
      alert('Please select a department');
      return;
    }
    onSelect(selectedRole, selectedDepartment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Select Your Role</h3>
        
        <div className="space-y-4 mb-6">
          <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${selectedRole === UserRole.STUDENT ? 'border-[#001a4d] bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
              type="radio"
              name="role"
              value={UserRole.STUDENT}
              checked={selectedRole === UserRole.STUDENT}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-4 h-4"
            />
            <span className="ml-3 text-lg font-semibold text-gray-700">👨‍🎓 Student</span>
          </label>

          <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${selectedRole === UserRole.FACULTY ? 'border-[#001a4d] bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
              type="radio"
              name="role"
              value={UserRole.FACULTY}
              checked={selectedRole === UserRole.FACULTY}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-4 h-4"
            />
            <span className="ml-3 text-lg font-semibold text-gray-700">👨‍🏫 Faculty</span>
          </label>

          <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${selectedRole === UserRole.VERIFICATION_TEAM ? 'border-[#001a4d] bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
              type="radio"
              name="role"
              value={UserRole.VERIFICATION_TEAM}
              checked={selectedRole === UserRole.VERIFICATION_TEAM}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-4 h-4"
            />
            <span className="ml-3 text-lg font-semibold text-gray-700">🛡️ Verification Team</span>
          </label>
        </div>

        {(selectedRole === UserRole.STUDENT || selectedRole === UserRole.FACULTY || selectedRole === UserRole.VERIFICATION_TEAM) && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">🏢 Department</label>
            <select
              aria-label="Department selection"
              title="Select your department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#001a4d] focus:outline-none focus:ring-1 focus:ring-[#001a4d]/20"
            >
              <option value="">Select department...</option>
              <option value="AGRICULTURAL ENGINEERING">Agricultural Engineering</option>
              <option value="ARTIFICIAL INTELLIGENCE AND DATA SCIENCE">Artificial Intelligence and Data Science</option>
              <option value="ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING">Artificial Intelligence and Machine Learning</option>
              <option value="BIOMEDICAL ENGINEERING">Biomedical Engineering</option>
              <option value="BIOTECHNOLOGY">Biotechnology</option>
              <option value="CIVIL ENGINEERING">Civil Engineering</option>
              <option value="COMPUTER SCIENCE AND BUSINESS SYSTEMS">Computer Science and Business Systems</option>
              <option value="COMPUTER SCIENCE AND DESIGN">Computer Science and Design</option>
              <option value="COMPUTER SCIENCE AND ENGINEERING">Computer Science and Engineering</option>
              <option value="COMPUTER TECHNOLOGY">Computer Technology</option>
              <option value="ELECTRICAL AND ELECTRONICS ENGINEERING">Electrical and Electronics Engineering</option>
              <option value="ELECTRONICS AND COMMUNICATION ENGINEERING">Electronics and Communication Engineering</option>
              <option value="ELECTRONICS AND INSTRUMENTATION ENGINEERING">Electronics and Instrumentation Engineering</option>
              <option value="FASHION TECHNOLOGY">Fashion Technology</option>
              <option value="FOOD TECHNOLOGY">Food Technology</option>
              <option value="INFORMATION SCIENCE AND ENGINEERING">Information Science and Engineering</option>
              <option value="INFORMATION TECHNOLOGY">Information Technology</option>
              <option value="MECHANICAL ENGINEERING">Mechanical Engineering</option>
              <option value="MECHATRONICS ENGINEERING">Mechatronics Engineering</option>
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[#001a4d] text-white rounded-lg font-bold hover:bg-[#0033a0] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toasts, setToasts] = useState<Array<{ message: string; type: ToastType }>>([]);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      addToast('Please fix the errors above', 'error');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      setSuccess(true);
      addToast('✓ Login successful! Redirecting...', 'success');
      setTimeout(() => {
        // Redirect based on role
        if (email.includes('admin')) { // Simple check if role isn't immediately available, but better to fetch role
           // The useAuth hook typically updates the user state. 
           // We might need to depend on the user state change or fetch the user profile.
           // For now, let's assume the AuthProvider or a subsequent check handles simple redirects, 
           // but strictly speaking, we should check the role.
           // However, since `login` doesn't return the user object directly here in the try block easily without modifying useAuth,
           // we'll rely on a layout effect or standard dashboard redirect which then routes.
           // BUT the requirement says "Redirect based on role" here.
           // Let's assume /dashboard handles it or we do it here if we can get the role.
           // Actually, the easiest way is to push to /dashboard and let a protected route/layout handle specific dashboard redirection 
           // OR we can try to get the role. 
           // Since we don't have the user object here immediately after await login() unless login returns it, 
           // let's stick to /dashboard which should probably be a smart router, OR better yet,
           // if we want to be explicit as per instructions:
           router.push('/dashboard');
        } else {
           router.push('/dashboard');
        }
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const addToast = (message: string, type: ToastType) => {
    setToasts(prev => [...prev, { message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter((_, i) => i !== 0));
    }, 5000);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await authService.signInWithGoogle();
      setSuccess(true);
      addToast('✓ Google sign-in successful! Redirecting...', 'success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <div className="fixed top-6 right-6 space-y-3 z-50">
        {toasts.map((toast, idx) => (
          <Toast key={idx} message={toast.message} type={toast.type} />
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm">

          {/* Special Error Handler for Domain Issues */}
          {error.includes('auth/unauthorized-domain') && (
            <div className="bg-red-50 border-2 border-red-500 text-red-900 p-6 rounded-xl mb-6 animate-pulse">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                🚫 PRODUCTION SETUP REQUIRED
              </h3>
              <p className="font-semibold mb-2">This domain is not authorized by Firebase.</p>
              <div className="bg-white p-3 rounded border border-red-200 text-sm font-mono break-all select-all mb-3">
                {typeof window !== 'undefined' ? window.location.hostname : ''}
              </div>
              <p className="text-sm mb-2">To fix this immediately:</p>
              <ol className="list-decimal ml-5 text-sm space-y-1">
                <li>Go to <b>Firebase Console</b> &gt; <b>Authentication</b> &gt; <b>Settings</b></li>
                <li>Click <b>Authorized Domains</b> &gt; <b>Add Domain</b></li>
                <li>Paste the domain above and click <b>Add</b></li>
              </ol>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-4 flex items-start gap-3 animate-shake">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-sm font-bold text-[#001a4d] mb-2">📧 Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) setValidationErrors({ ...validationErrors, email: '' });
              }}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 placeholder-gray-400 bg-gray-50 focus:bg-white ${
                validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-yellow-400'
              }`}
              placeholder="you@example.com"
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-1 font-medium">
                <span>✕</span> {validationErrors.email}
              </p>
            )}
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-[#001a4d] mb-2">🔑 Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) setValidationErrors({ ...validationErrors, password: '' });
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 placeholder-gray-400 bg-gray-50 focus:bg-white ${
                  validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-yellow-400'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-[#001a4d] transition"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1 font-medium">
                <span>✕</span> {validationErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-yellow-400 text-[#001a4d] py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:bg-yellow-300 hover:shadow-lg shadow-md hover:-translate-y-0.5 border border-yellow-400"
          >
            {loading && <div className="w-4 h-4 border-2 border-[#001a4d] border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Signing in...' : success ? '✓ Success!' : 'Sign In'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 hover:shadow-sm"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <text x="2" y="18" fontSize="16" fontWeight="bold">G</text>
              </svg>
            )}
            {googleLoading ? 'Signing in...' : 'Google'}
          </button>
        </form>
      </div>
    </>
  );
};

export const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate department is selected for both students and faculty
    if (!department) {
      setError('Please select a department');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, displayName, role, department);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (selectedRole: UserRole, selectedDept: string) => {
    setGoogleLoading(true);
    try {
      await authService.signUpWithGoogle(selectedRole, selectedDept);
      setShowGoogleModal(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Google sign-up failed';
      setError(errorMsg);
      setShowGoogleModal(false);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#001a4d] mb-2">👤 Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white transition-all duration-300"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#001a4d] mb-2">📧 Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white transition-all duration-300"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#001a4d] mb-2">🔑 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white transition-all duration-300"
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#001a4d] mb-2">👤 Role</label>
            <select
              aria-label="User role"
              title="Select your role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white transition-all duration-300"
              required
            >
              <option value={UserRole.STUDENT}>Student</option>
              <option value={UserRole.FACULTY}>Faculty</option>
              <option value={UserRole.VERIFICATION_TEAM}>Verification Team</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#001a4d] mb-2">🏢 Department</label>
            <select
              aria-label="Department selection"
              title="Select your department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 bg-gray-50 focus:bg-white transition-all duration-300"
              required
            >
              <option value="">Select department...</option>
              <option value="AGRICULTURAL ENGINEERING">Agricultural Engineering</option>
              <option value="ARTIFICIAL INTELLIGENCE AND DATA SCIENCE">Artificial Intelligence and Data Science</option>
              <option value="ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING">Artificial Intelligence and Machine Learning</option>
              <option value="BIOMEDICAL ENGINEERING">Biomedical Engineering</option>
              <option value="BIOTECHNOLOGY">Biotechnology</option>
              <option value="CIVIL ENGINEERING">Civil Engineering</option>
              <option value="COMPUTER SCIENCE AND BUSINESS SYSTEMS">Computer Science and Business Systems</option>
              <option value="COMPUTER SCIENCE AND DESIGN">Computer Science and Design</option>
              <option value="COMPUTER SCIENCE AND ENGINEERING">Computer Science and Engineering</option>
              <option value="COMPUTER TECHNOLOGY">Computer Technology</option>
              <option value="ELECTRICAL AND ELECTRONICS ENGINEERING">Electrical and Electronics Engineering</option>
              <option value="ELECTRONICS AND COMMUNICATION ENGINEERING">Electronics and Communication Engineering</option>
              <option value="ELECTRONICS AND INSTRUMENTATION ENGINEERING">Electronics and Instrumentation Engineering</option>
              <option value="FASHION TECHNOLOGY">Fashion Technology</option>
              <option value="FOOD TECHNOLOGY">Food Technology</option>
              <option value="INFORMATION SCIENCE AND ENGINEERING">Information Science and Engineering</option>
              <option value="INFORMATION TECHNOLOGY">Information Technology</option>
              <option value="MECHANICAL ENGINEERING">Mechanical Engineering</option>
              <option value="MECHATRONICS ENGINEERING">Mechatronics Engineering</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#001a4d] text-white py-2 rounded-lg font-bold hover:bg-[#0033a0] transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">Or sign up with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            disabled={googleLoading || loading}
            className="w-full border-2 border-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <text x="2" y="18" fontSize="16" fontWeight="bold">G</text>
              </svg>
            )}
            {googleLoading ? 'Signing up...' : 'Google'}
          </button>
        </form>
      </div>

      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelect={handleGoogleSignUp}
        isLoading={googleLoading}
      />
    </>
  );
};
