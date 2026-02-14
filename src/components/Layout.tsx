import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { ModernButton } from './ModernButton';
import { ModernBadge } from './ModernBadge';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-[#001a4d] border-b border-white/10 shadow-lg sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-full px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity flex-shrink-0 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🛡️</span>
          <div>
            <span className="font-bold text-lg hidden sm:block text-yellow-400">AchivRa</span>
            <span className="text-xs text-blue-200 hidden sm:block">Certificate Verification</span>
          </div>
        </Link>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* User Profile Card */}
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-[#001a4d] font-bold text-sm flex-shrink-0 shadow-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-yellow-400 truncate uppercase tracking-wider">{user.role}</p>
                </div>
              </div>

              {/* Department Badge */}
              {user.department && (
                <ModernBadge variant="default" size="sm" className="!bg-white/10 !text-yellow-400 border border-yellow-400/20">
                  📍 {user.department}
                </ModernBadge>
              )}

              {/* Logout Button */}
              <ModernButton onClick={handleLogout} variant="ghost" size="sm" className="!text-red-400 !border-red-400 hover:!bg-red-400/10">
                Logout
              </ModernButton>
            </>
          ) : (
            <>
              <Link href="/login">
                <ModernButton variant="ghost" size="sm" className="!text-yellow-400 !border-yellow-400 hover:!bg-yellow-400/10">
                  Login
                </ModernButton>
              </Link>
              <Link href="/register">
                <ModernButton variant="primary" size="sm">
                  Register
                </ModernButton>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export const Sidebar = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(true);

  const getMenuItems = () => {
    switch (user?.role) {
      case UserRole.STUDENT:
        return [
          { label: 'Dashboard', href: '/dashboard', icon: '📊' },
          { label: 'Submit', href: '/student/submit', icon: '📜' },
        ];
      case UserRole.FACULTY:
        return [
          { label: 'Dashboard', href: '/dashboard', icon: '📊' },
          { label: 'View Students', href: '/faculty/queue', icon: '👥' },
        ];
      case UserRole.VERIFICATION_TEAM:
        return [
          { label: 'Dashboard', href: '/verification/dashboard', icon: '📊' },
          { label: 'Verification Queue', href: '/verification/queue', icon: '⏳' },
          { label: 'Approved List', href: '/verification/approved', icon: '✅' },
        ];
      case UserRole.ADMIN:
        return [
          { label: 'Dashboard', href: '/dashboard', icon: '📊' },
          { label: 'Users', href: '/admin/users', icon: '👥' },
          { label: 'Categories', href: '/admin/categories', icon: '📂' },
          { label: 'Reports', href: '/admin/reports', icon: '📈' },
          { label: 'Alerts', href: '/notifications', icon: '🔔' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-64' : 'w-20'
        } bg-[#001a4d] border-r border-white/5 shadow-xl transition-all duration-300 flex flex-col relative z-20`}
      >
        {/* Toggle Button */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          {isOpen && <h2 className="text-xs font-bold text-blue-200 uppercase tracking-wider">Navigation</h2>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 text-yellow-400 mx-auto"
            title={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-yellow-400 hover:text-[#001a4d] hover:translate-x-1 hover:shadow-lg text-blue-100"
            >
              <span className="text-xl flex-shrink-0 transition-transform group-hover:scale-110">{item.icon}</span>
              {isOpen && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-center bg-[#001030]">
          {isOpen && (
            <div className="text-xs text-blue-300">
              <p className="font-semibold text-yellow-400">AchivRa System</p>
              <p>© 2026</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 relative">
        {/* Background gradient for main content area */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#001a4d] to-transparent pointer-events-none" />
        <div className="relative z-10 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export const PageLayout = ({
  children,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">{title}</h1>
          {subtitle && <p className="text-blue-200 text-sm font-medium">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0 transform hover:scale-105 transition-transform">{action}</div>}
      </div>
      
      {children}
    </div>
  );
};
