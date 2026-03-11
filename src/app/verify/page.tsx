'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifySearchPage() {
  const [verifyId, setVerifyId] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyId.trim()) {
      router.push(`/verify/${verifyId.trim()}`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8 border-[#001a4d]">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
        🔍
      </div>
      <h1 className="text-3xl font-bold text-[#001a4d] mb-2">Verify Certificate</h1>
      <p className="text-gray-500 mb-8">Enter a Verification ID to view the authenticity of an achievement.</p>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="e.g., 5f8a..."
            value={verifyId}
            onChange={(e) => setVerifyId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#001a4d] focus:ring-0 transition-colors text-center font-mono text-lg"
            maxLength={30}
            required
          />
        </div>
        <button
          type="submit"
          disabled={!verifyId.trim()}
          className="w-full bg-[#001a4d] text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Verify Achievement
        </button>
      </form>
    </div>
  );
}
