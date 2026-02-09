import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Notification } from '@/types';

export const notificationService = {
  // Create notification
  async createNotification(userId: string, type: string, title: string, message: string, relatedAchievementId?: string, relatedAchievementTitle?: string) {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        title,
        message,
        relatedAchievementId: relatedAchievementId || '',
        relatedAchievementTitle: relatedAchievementTitle || '',
        actionUrl: relatedAchievementId ? `/dashboard/achievements/${relatedAchievementId}` : '',
        isRead: false,
        createdAt: Timestamp.now(),
        readAt: null,
        priority: type.includes('approved') ? 'high' : 'normal',
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get user notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .filter((doc) => doc.data().userId === userId)
        .map((doc) => ({
          id: doc.id,
          userId: doc.data().userId,
          type: doc.data().type,
          title: doc.data().title,
          message: doc.data().message,
          relatedAchievementId: doc.data().relatedAchievementId || '',
          relatedAchievementTitle: doc.data().relatedAchievementTitle || '',
          actionUrl: doc.data().actionUrl || '',
          isRead: doc.data().isRead || false,
          priority: doc.data().priority || 'normal',
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          readAt: doc.data().readAt?.toDate() || null,
        } as Notification));
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
        isRead: true,
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
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter((n) => !n.isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },
};
