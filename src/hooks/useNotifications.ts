import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Notification } from '@/types';

export const useNotifications = (userId: string | undefined, role: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId || !role || !db) return;

    // Verification team receives group notifications stored with recipientId 'all_verification_team'
    const targetRecipientId = role === 'verification_team' ? 'all_verification_team' : userId;

    const qByRecipient = query(
      collection(db, 'notifications'),
      where('recipientId', '==', targetRecipientId)
    );

    // Backward compatibility for older documents still using `userId`
    const qByLegacyUserId = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    let unsubscribe1: (() => void) | undefined;
    let unsubscribe2: (() => void) | undefined;

    const mergeAndCommit = (docs: Array<{ id: string; data: any }>) => {
      const map = new Map<string, any>();
      for (const d of docs) map.set(d.id, d.data);
      const merged = Array.from(map.entries()).map(([id, data]) => ({
        id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
        readAt: data.readAt?.toDate?.() || null,
      })) as Notification[];

      const unread = merged.filter((n: any) => (n.status ? n.status === 'unread' : !n.isRead));
      setNotifications(unread.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setUnreadCount(unread.length);
    };

    const buffer: Array<{ id: string; data: any }> = [];

    unsubscribe1 = onSnapshot(qByRecipient, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, data: d.data() }));
      buffer.splice(0, buffer.length, ...docs);
      mergeAndCommit(buffer);
    });

    unsubscribe2 = onSnapshot(qByLegacyUserId, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, data: d.data() }));
      // Merge legacy results into the existing buffer
      const existing = new Map(buffer.map((x) => [x.id, x.data]));
      for (const d of docs) existing.set(d.id, d.data);
      const mergedBuffer = Array.from(existing.entries()).map(([id, data]) => ({ id, data }));
      mergeAndCommit(mergedBuffer);
    });

    return () => {
      unsubscribe1?.();
      unsubscribe2?.();
    };
  }, [userId, role]);

  return { notifications, unreadCount };
};
