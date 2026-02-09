'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

export const NotificationsComponent = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      const notifs = await notificationService.getUserNotifications(user.id);
      setNotifications(notifs);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToast = (message: string, type: Toast['type']) => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      loadNotifications();
      addToast('✓ Notification deleted', 'success');
    } catch (err) {
      addToast('Failed to delete notification', 'error');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval': return '🎉';
      case 'rejection': return '⚠️';
      case 'pending': return '⏳';
      case 'update': return '📢';
      default: return '📬';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'approval': return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'rejection': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'pending': return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
      case 'update': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      default: return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const filteredNotifications = notifications;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-8">
      {/* Toasts */}
      <div className="fixed top-6 right-6 space-y-3 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-slide-in-right px-6 py-4 rounded-lg shadow-lg text-white font-semibold max-w-sm ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔔 Notifications
          </h1>
          <p className="text-gray-600">Achievement status updates</p>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-lg">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-xl">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`animate-slide-in-up border-l-4 border-l-orange-500 rounded-lg p-6 transition transform hover:shadow-lg cursor-default ${getNotificationColor(notification.type)}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">{notification.message}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.4s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
