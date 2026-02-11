'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm } from '@/components/AuthForms';
import { Navbar } from '@/components/Layout';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#001a4d] to-[#0033a0] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="text-center">
            <span className="text-4xl filter drop-shadow-md">🛡️</span>
            <h2 className="mt-6 text-3xl font-bold text-white drop-shadow-sm">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-blue-200">
              Join AchivRa to celebrate excellence
            </p>
          </div>
          <RegisterForm />
          <div className="text-center mt-6">
            <p className="text-blue-200">
              Already have an account?{' '}
              <a href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold hover:underline transition-colors">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
