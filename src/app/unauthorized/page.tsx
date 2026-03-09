'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          🚫
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You do not have permission to view this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => router.back()}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors"
          >
            Go Back
          </button>
          <Link 
            href="/dashboard"
            className="w-full py-3 px-4 bg-[#001a4d] hover:bg-[#0033a0] text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-900/20"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
