import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Notification } from '@/types';

type NotificationType = 'submission' | 'result' | string;
type NotificationStatus = 'unread' | 'read' | string;

export const notificationService = {
  // Create notification using the requested schema.
  // Required fields: recipientId, message, type (submission/result), status (unread/read), createdAt
  async addNotification(data: {
    recipientId: string;
    type: NotificationType;
    message: string;
    // Optional extras for richer UI/navigation
    title?: string;
    actionUrl?: string;
    relatedAchievementId?: string;
    relatedAchievementTitle?: string;
  }) {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      await addDoc(collection(db, 'notifications'), {
        recipientId: data.recipientId,
        type: data.type,
        message: data.message,
        title: data.title || '',
        actionUrl: data.actionUrl || '',
        relatedAchievementId: data.relatedAchievementId || '',
        relatedAchievementTitle: data.relatedAchievementTitle || '',
        status: 'unread' as NotificationStatus,
        // Keep legacy fields so older UI/routes won't instantly break.
        isRead: false,
        read: false,
        createdAt: Timestamp.now(),
        readAt: null,
      });
    } catch (error) {
      console.error('Error adding notification:', error);
      throw error;
    }
  },

  async getNotifications(userId: string, role?: string): Promise<Notification[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const allDocs = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          ...data,
          // Normalize recipientId so the newer UI can rely on it.
          recipientId: data.recipientId ?? data.userId ?? '',
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
          readAt: data.readAt?.toDate?.() || null,
        };
      }) as any[];

      // Backward compatible filtering:
      // - student notifications are stored with recipientId == student uid
      // - verifier group notifications are stored with recipientId == 'all_verification_team'
      // - legacy documents might still have userId
      return allDocs.filter((n) => {
        const recipientId = n.recipientId ?? n.userId;
        const isVerifierGroup = role === 'verification_team' && recipientId === 'all_verification_team';
        return recipientId === userId || isVerifierGroup;
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  },

  // Legacy wrapper used by older components.
  // Signature in older code: (userId, type, title, message, relatedAchievementId?)
  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    relatedAchievementId?: string,
    relatedAchievementTitle?: string
  ) {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      // Map legacy `type` values into the requested `type` domain.
      const normalizedType: NotificationType =
        type === 'achievement_submitted' || type.includes('submitted') ? 'submission'
        : type === 'approval' || type === 'rejection' || type.includes('approved') || type.includes('rejected')
          ? 'result'
          : type;

      await this.addNotification({
        recipientId: userId,
        type: normalizedType,
        title,
        message,
        relatedAchievementId,
        relatedAchievementTitle,
        actionUrl: relatedAchievementId ? `/dashboard/achievements/${relatedAchievementId}` : '',
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get user notifications
  async getUserNotifications(userId: string, role?: string): Promise<Notification[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      // Prefer queries by recipientId; fall back to legacy userId.
      // Note: we avoid multi-where queries here to not require new composite indexes.
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const all = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          ...data,
          recipientId: data.recipientId ?? data.userId ?? '',
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
          readAt: data.readAt?.toDate?.() || null,
        } as any;
      });

      return all.filter((n) => {
        const recipientId = n.recipientId ?? n.userId;
        const isVerifierGroup = role === 'verification_team' && recipientId === 'all_verification_team';
        return recipientId === userId || isVerifierGroup;
      }) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'read',
        isRead: true, // legacy compatibility
        read: true, // legacy compatibility
        readAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get unread count
  async getUnreadCount(userId: string, role?: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId, role);
      return notifications.filter((n) => (n.status ? n.status === 'unread' : !n.isRead)).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },
};
