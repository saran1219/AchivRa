import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/services/notificationService';

export const NotificationBell = () => {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications(user?.id, user?.role);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notifId: string) => {
    await notificationService.markAsRead(notifId);
  };

  const displayNotifications = notifications.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors relative group"
      >
        <span className="text-xl text-yellow-400 group-hover:scale-110 transition-transform inline-block">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-[#001a4d] shadow-lg animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-gray-100 overflow-hidden z-[100] animate-fade-in origin-top-right backdrop-blur-md">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-[#001a4d] flex items-center gap-2">
              <span className="text-lg">🔔</span> Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold shadow-sm">
                {unreadCount} New
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {displayNotifications.length > 0 ? (
              displayNotifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id)}
                  className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-all ${
                    'bg-blue-50/40 relative'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className={`text-sm font-bold leading-tight text-[#001a4d]`}>
                      {n.title || (n.type === 'submission' ? 'New Submission' : 'Verification Update')}
                    </p>
                    {n.status !== 'read' && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-gray-600 font-medium">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">
                    {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center opacity-70">
                <span className="text-4xl mb-3 grayscale">📭</span>
                <p className="text-sm font-bold text-[#001a4d]">All caught up!</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">No new notifications</p>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-gray-500 hover:text-[#001a4d] transition-colors"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
