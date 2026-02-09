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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">🎓 Student Achievement System</h1>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-6 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Celebrate Student <span className="text-blue-600">Achievements</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive platform to digitally record, verify, and manage student achievements with ease
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-lg hover:shadow-xl"
            >
              Get Started Now
            </Link>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-bold text-lg"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition transform hover:scale-105">
            <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
            <p className="text-gray-600">Students Using Our System</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition transform hover:scale-105">
            <div className="text-4xl font-bold text-green-600 mb-2">5000+</div>
            <p className="text-gray-600">Achievements Verified</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition transform hover:scale-105">
            <div className="text-4xl font-bold text-purple-600 mb-2">99%</div>
            <p className="text-gray-600">System Uptime</p>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-20">
          <h3 className="text-4xl font-bold text-center text-gray-900 mb-12">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition hover:translate-y-[-5px]">
              <div className="text-4xl mb-4">📝</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Easy Upload</h4>
              <p className="text-gray-600">
                Students can easily upload their achievements with certificates and supporting documents
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition hover:translate-y-[-5px]">
              <div className="text-4xl mb-4">✅</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Faculty Verification</h4>
              <p className="text-gray-600">
                Faculty members can review and verify student achievements quickly and efficiently
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition hover:translate-y-[-5px]">
              <div className="text-4xl mb-4">🔔</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Instant Notifications</h4>
              <p className="text-gray-600">
                Get real-time notifications about your achievement status and approvals
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition hover:translate-y-[-5px]">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h4>
              <p className="text-gray-600">
                Track your achievements with comprehensive analytics and statistics
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition hover:translate-y-[-5px]">
              <div className="text-4xl mb-4">🛡️</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Secure & Safe</h4>
              <p className="text-gray-600">
                Enterprise-grade security to protect your achievements and personal data
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition hover:translate-y-[-5px]">
              <div className="text-4xl mb-4">👥</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Role-Based Access</h4>
              <p className="text-gray-600">
                Customized experience for Students, Faculty, and Administrators
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-xl p-12 mb-20 text-white">
          <h3 className="text-4xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold mb-2">Register</h4>
              <p className="text-blue-100">Create your account as Student, Faculty, or Admin</p>
            </div>
            <div className="text-center">
              <div className="bg-white text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold mb-2">Upload</h4>
              <p className="text-blue-100">Upload your achievements with certificates</p>
            </div>
            <div className="text-center">
              <div className="bg-white text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold mb-2">Verify</h4>
              <p className="text-blue-100">Faculty reviews and verifies your submissions</p>
            </div>
            <div className="text-center">
              <div className="bg-white text-blue-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h4 className="font-bold mb-2">Celebrate</h4>
              <p className="text-blue-100">Receive notifications and view your achievements</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mb-20">
          <h3 className="text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students already using our platform
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold text-lg shadow-lg hover:shadow-xl"
            >
              Register Now
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-bold text-lg"
            >
              Sign In
            </Link>
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">About Us</h4>
              <p className="text-gray-400">
                The leading platform for managing and verifying student achievements
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400">support@studentachievement.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Student Achievement System. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </main>
  );
}
