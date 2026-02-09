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
    <nav className="bg-[#FEFACD] border-b-2 border-[#5F4A8B]/10 shadow-sm sticky top-0 z-50">
      <div className="max-w-full px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#5F4A8B] hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <span className="text-2xl">🏆</span>
          <span className="font-bold text-lg hidden sm:block">Achievement</span>
        </Link>

        {/* User Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* User Profile Card */}
              <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-[#5F4A8B]/20 hover:border-[#5F4A8B]/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5F4A8B] to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-[#5F4A8B] truncate">{user.role}</p>
                </div>
              </div>

              {/* Department Badge */}
              {user.department && (
                <ModernBadge variant="primary" size="sm">
                  📍 {user.department}
                </ModernBadge>
              )}

              {/* Logout Button */}
              <ModernButton onClick={handleLogout} variant="danger" size="sm">
                Logout
              </ModernButton>
            </>
          ) : (
            <>
              <Link href="/login">
                <ModernButton variant="ghost" size="sm">
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
          { label: 'Verify', href: '/faculty/queue', icon: '⏳' },
          { label: 'Verified', href: '/faculty/verified', icon: '✅' },
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-56' : 'w-20'
        } bg-white border-r border-[#5F4A8B]/10 shadow-sm transition-all duration-300 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-[#5F4A8B]/10 flex items-center justify-between flex-shrink-0">
          {isOpen && <h2 className="text-sm font-bold text-[#5F4A8B]">Menu</h2>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-[#5F4A8B]/10 rounded-lg transition-all duration-300 text-[#5F4A8B]"
            title={isOpen ? 'Collapse' : 'Expand'}
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[#5F4A8B]/10 hover:text-[#5F4A8B] text-gray-700"
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {isOpen && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#5F4A8B]/10 text-center">
          {isOpen && <p className="text-xs text-gray-500">© 2026</p>}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto animate-in fade-in duration-500">
        {children}
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
    <div className="p-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[#5F4A8B] mb-2">{title}</h1>
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      
      {children}
    </div>
  );
};
