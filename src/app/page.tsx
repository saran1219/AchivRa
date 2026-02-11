'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#001a4d] to-[#0066cc]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#001a4d] via-[#0033a0] to-[#004d99]">
      {/* Navigation */}
      <nav className="bg-transparent backdrop-blur-md sticky top-0 z-50 border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-4xl">🛡️</div>
              <div>
                <h1 className="text-2xl font-bold text-yellow-400">AchivRa</h1>
                <p className="text-xs text-yellow-200">Certificate Verification</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-6 py-2 bg-white/10 border-2 border-yellow-400 text-yellow-400 rounded-lg hover:bg-white/20 transition font-semibold backdrop-blur-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-yellow-400 text-[#001a4d] rounded-lg hover:bg-yellow-300 transition font-bold shadow-lg hover:shadow-xl"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          {/* Logo Animation */}
          <div className="mb-8 animate-bounce-slow">
            <div className="inline-block text-7xl mb-4">🛡️</div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
              AchivRa
            </h1>
            <p className="text-2xl text-yellow-300 font-semibold tracking-widest">CERTIFICATE VERIFICATION</p>
          </div>

          {/* Main Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Unlock Your <span className="text-yellow-400">Potential</span> with <br /> Verified Achievements
          </h2>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-yellow-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            From students uploading their accomplishments to faculty verifying excellence, AchivRa makes achievement management seamless, secure, and celebration-worthy.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap mb-16">
            <Link
              href="/register"
              className="group px-8 py-4 bg-yellow-400 text-[#001a4d] rounded-lg hover:bg-yellow-300 transition font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transform"
            >
              Start Your Journey
              <span className="ml-2 inline-block group-hover:translate-x-1 transition">→</span>
            </Link>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white/10 border-2 border-yellow-400 text-yellow-400 rounded-lg hover:bg-white/20 transition font-bold text-lg backdrop-blur-sm"
            >
              Explore Features
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="animate-pulse">
            <p className="text-yellow-200 text-sm mb-2">Scroll to discover</p>
            <div className="text-2xl">⬇️</div>
          </div>
        </div>
      </section>

      {/* Why Choose AchivRa Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 bg-white/5 backdrop-blur-md">
        <h3 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">Why Choose AchivRa?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-gradient-to-br from-yellow-400/20 to-yellow-400/10 border-2 border-yellow-300 rounded-xl p-8 hover:border-yellow-200 transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="text-5xl mb-4 transition relative z-10">🚀</div>
            <h4 className="!text-white font-bold text-2xl mb-3 relative z-10">Lightning Fast</h4>
            <p className="!text-gray-200 font-medium relative z-10">
              Instant uploads, quick verifications, and real-time notifications to keep everything moving
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-gradient-to-br from-blue-400/20 to-blue-400/10 border-2 border-blue-300 rounded-xl p-8 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="text-5xl mb-4 transition relative z-10">🔐</div>
            <h4 className="!text-white font-bold text-2xl mb-3 relative z-10">Fort Knox Security</h4>
            <p className="!text-gray-200 font-medium relative z-10">
              Enterprise-level encryption ensuring your achievements and certificates are always protected
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-gradient-to-br from-purple-400/20 to-purple-400/10 border-2 border-purple-300 rounded-xl p-8 hover:border-purple-200 transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="text-5xl mb-4 transition relative z-10">🎯</div>
            <h4 className="!text-white font-bold text-2xl mb-3 relative z-10">Department Smart</h4>
            <p className="!text-gray-200 font-medium relative z-10">
              Faculty from your department verify your achievements, ensuring relevance and accuracy
            </p>
          </div>

          {/* Card 4 */}
          <div className="group bg-gradient-to-br from-green-400/20 to-green-400/10 border-2 border-green-300 rounded-xl p-8 hover:border-green-200 transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="text-5xl mb-4 transition relative z-10">📊</div>
            <h4 className="!text-white font-bold text-2xl mb-3 relative z-10">Analytics Powerhouse</h4>
            <p className="!text-gray-200 font-medium relative z-10">
              Track your growth with beautiful dashboards and comprehensive achievement statistics
            </p>
          </div>

          {/* Card 5 */}
          <div className="group bg-gradient-to-br from-red-400/20 to-red-400/10 border-2 border-red-300 rounded-xl p-8 hover:border-red-200 transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="text-5xl mb-4 transition relative z-10">💬</div>
            <h4 className="!text-white font-bold text-2xl mb-3 relative z-10">Real-Time Updates</h4>
            <p className="!text-gray-200 font-medium relative z-10">
              Instant notifications about approvals, rejections, and feedback from faculty members
            </p>
          </div>

          {/* Card 6 */}
          <div className="group bg-gradient-to-br from-indigo-400/20 to-indigo-400/10 border-2 border-indigo-300 rounded-xl p-8 hover:border-indigo-200 transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="text-5xl mb-4 transition relative z-10">👥</div>
            <h4 className="!text-white font-bold text-2xl mb-3 relative z-10">Role-Tailored Experience</h4>
            <p className="!text-gray-200 font-medium relative z-10">
              Custom dashboards and workflows designed specifically for students, faculty, and admins
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h3 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">How AchivRa Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
              1
            </div>
            <h4 className="font-bold text-white mb-2 text-xl">Register</h4>
            <p className="text-yellow-200">Create your account as Student, Faculty, or Admin in seconds</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
              2
            </div>
            <h4 className="font-bold text-white mb-2 text-xl">Upload</h4>
            <p className="text-blue-200">Students share achievements with certificates and proof documents</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
              3
            </div>
            <h4 className="font-bold text-white mb-2 text-xl">Verify</h4>
            <p className="text-purple-200">Faculty from your department reviews and approves submissions</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
              4
            </div>
            <h4 className="font-bold text-white mb-2 text-xl">Celebrate</h4>
            <p className="text-green-200">Get verified badges and real-time notifications on achievements</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Shine?</h3>
        <p className="text-xl text-yellow-100 mb-8">
          Join thousands of students celebrating their verified achievements today
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="px-8 py-4 bg-yellow-400 text-[#001a4d] rounded-lg hover:bg-yellow-300 transition font-bold text-lg shadow-2xl hover:shadow-3xl"
          >
            Get Started Now
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white/10 border-2 border-yellow-400 text-yellow-400 rounded-lg hover:bg-white/20 transition font-bold text-lg backdrop-blur-sm"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#001a4d] border-t border-yellow-400/20 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-2xl">🛡️</div>
                <h4 className="font-bold text-yellow-400">AchivRa</h4>
              </div>
              <p className="text-yellow-100">
                The ultimate platform for managing and verifying student achievements with excellence
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-yellow-400">Quick Links</h4>
              <ul className="space-y-2 text-yellow-100">
                <li><Link href="/login" className="hover:text-yellow-300 transition">Login</Link></li>
                <li><Link href="/register" className="hover:text-yellow-300 transition">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-yellow-400">Contact</h4>
              <p className="text-yellow-100">support@achivra.com</p>
              <p className="text-yellow-200 text-sm mt-2">Available 24/7</p>
            </div>
          </div>
          <div className="border-t border-yellow-400/30 pt-8 text-center text-yellow-200">
            <p>&copy; 2026 AchivRa - Certificate Verification. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
      `}</style>
    </main>
  );
}
