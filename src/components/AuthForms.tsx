'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Toast, ToastType } from './Toast';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toasts, setToasts] = useState<Array<{ message: string; type: ToastType }>>([]);
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({});
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
        router.push('/dashboard');
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

  return (
    <>
      <div className="fixed top-6 right-6 space-y-3 z-50">
        {toasts.map((toast, idx) => (
          <Toast key={idx} message={toast.message} type={toast.type} />
        ))}
      </div>

      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-300 to-amber-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 border-2 border-white rounded-2xl shadow-2xl bg-white backdrop-blur animate-bounce-in">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce">🔐</div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-4 flex items-start gap-3 animate-shake">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) setValidationErrors({ ...validationErrors, email: '' });
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 placeholder-gray-400 ${
                  validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">
                  <span>✕</span> {validationErrors.email}
                </p>
              )}
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">🔑 Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors({ ...validationErrors, password: '' });
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 placeholder-gray-400 ${
                    validationErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-800 transition"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  <span>✕</span> {validationErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-300"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Signing in...' : success ? '✓ Success!' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{' '}
            <a href="/register" className="text-orange-600 font-semibold">
              Create one
            </a>
          </p>
        </div>
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
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 border-2 border-white rounded-2xl shadow-2xl bg-white">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-4xl font-bold text-orange-600">Create Account</h2>
            <p className="text-gray-500 mt-2">Join the Student Achievement System</p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-4">
              <span>⚠️ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Full Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📧 Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🔑 Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Role</label>
              <select
                aria-label="User role"
                title="Select your role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                required
              >
                <option value={UserRole.STUDENT}>Student</option>
                <option value={UserRole.FACULTY}>Faculty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🏢 Department</label>
              <select
                aria-label="Department selection"
                title="Select your department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                required
              >
                <option value="">Select department...</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="ME">Mechanical (ME)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-orange-600 font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </>
  );
};
