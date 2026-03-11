'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Achievement } from '@/types';
import Link from 'next/link';
import { ModernBadge } from '@/components/ModernBadge';

export default function VerifyDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        if (!id || !db) return;
        const docRef = doc(db, 'achievements', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === 'approved') {
            setAchievement({
              id: docSnap.id,
              ...data,
              eventDate: data.eventDate?.toDate() || new Date(),
              submittedAt: data.submittedAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              verificationDate: data.verificationDate?.toDate() || null,
            } as Achievement);
          }
        }
      } catch (error) {
        console.error('Error fetching achievement for verification:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievement();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#001a4d] border-t-yellow-400 mb-4"></div>
        <p className="text-gray-500 font-medium tracking-wide">Retrieving Certificate...</p>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-8 border-red-500">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner text-red-500">
          ✕
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
        <p className="text-gray-600 mb-8">Certificate not found or invalid.</p>
        <button
          onClick={() => router.push('/verify')}
          className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Try Another ID
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-br from-[#001a4d] to-[#0033a0] p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
        
        <div className="relative z-10 text-white">
          <div className="w-20 h-20 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-400 backdrop-blur-sm">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Verified Authentic</h1>
          <p className="text-blue-200 opacity-90">This certificate has been issued and verified by the institution.</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Student Name</p>
            <p className="text-lg font-bold text-[#001a4d]">{achievement.studentName}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Achievement Title</p>
            <p className="text-lg font-bold text-[#001a4d] truncate" title={achievement.title}>{achievement.title}</p>
          </div>
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Category / Organization</p>
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-sm font-semibold text-gray-700 bg-gray-200/50 w-fit px-2 py-0.5 rounded">{achievement.category}</span>
              <span className="text-sm text-gray-600 truncate">{achievement.organizationName}</span>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Verification Details</p>
            <div className="flex items-center gap-2 mt-1">
              <ModernBadge variant="success">APPROVED</ModernBadge>
              {achievement.verificationDate && (
                <span className="text-sm text-gray-500">
                  on {new Date(achievement.verificationDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 text-center space-y-4">
          <div className="inline-block px-4 py-2 bg-blue-50 text-[#001a4d] rounded-lg font-mono text-sm font-medium border border-blue-100">
            ID: {achievement.id}
          </div>
          
          <Link href="/verify" className="block text-gray-500 hover:text-[#001a4d] font-semibold transition-colors mt-6">
            ← Verify another certificate
          </Link>
        </div>
      </div>
    </div>
  );
}
