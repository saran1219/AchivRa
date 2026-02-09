import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Achievement, AchievementStatus } from '@/types';

export const achievementService = {
  // Create new achievement
  async createAchievement(
    studentId: string,
    studentEmail: string,
    studentName: string,
    title: string,
    description: string,
    category: string,
    organizationName: string,
    eventDate: Date,
    department: string,
    tags: string[] = []
  ) {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      const docRef = await addDoc(collection(db, 'achievements'), {
        studentId,
        studentEmail,
        studentName,
        title,
        description,
        category,
        organizationName,
        eventDate: Timestamp.fromDate(eventDate),
        certificateUrl: '',
        certificateFileName: '',
        certificateSize: 0,
        status: AchievementStatus.PENDING,
        remarks: '',
        verifiedBy: '',
        verifiedByName: '',
        verificationDate: null,
        department,
        studentDepartment: department,
        submittedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        tags,
        isPublic: false,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }
  },

  // Upload certificate file
  async uploadCertificate(achievementId: string, studentId: string, file: File) {
    try {
      if (!storage) throw new Error('Cloud Storage not initialized');
      if (!db) throw new Error('Firestore database not initialized');
      const storageRef = ref(storage, `certificates/${studentId}/${achievementId}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update achievement with certificate URL
      await updateDoc(doc(db, 'achievements', achievementId), {
        certificateUrl: downloadURL,
        certificateFileName: file.name,
        certificateSize: file.size,
        updatedAt: Timestamp.now(),
      });

      return downloadURL;
    } catch (error) {
      console.error('Error uploading certificate:', error);
      throw error;
    }
  },

  // Get student achievements
  async getStudentAchievements(studentId: string): Promise<Achievement[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      const q = query(
        collection(db, 'achievements'),
        where('studentId', '==', studentId)
      );
      const querySnapshot = await getDocs(q);
      const achievements = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate() || new Date(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        verificationDate: doc.data().verificationDate?.toDate() || null,
      })) as Achievement[];
      
      // Sort by submittedAt in descending order (newest first)
      return achievements.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  },

  // Get all pending achievements (for verification)
  async getPendingAchievements(): Promise<Achievement[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      const q = query(
        collection(db, 'achievements'),
        where('status', '==', AchievementStatus.PENDING)
      );
      const querySnapshot = await getDocs(q);
      const achievements = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate() || new Date(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        verificationDate: doc.data().verificationDate?.toDate() || null,
      })) as Achievement[];
      
      // Sort by submittedAt in descending order (newest first)
      return achievements.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching pending achievements:', error);
      return [];
    }
  },

  // Get all achievements
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      const q = query(collection(db, 'achievements'), orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate() || new Date(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        verificationDate: doc.data().verificationDate?.toDate() || null,
      })) as Achievement[];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  },

  // Update achievement status
  async updateAchievementStatus(
    achievementId: string,
    status: AchievementStatus,
    remarks: string = '',
    verifiedBy: string = '',
    verifiedByName: string = ''
  ) {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      await updateDoc(doc(db, 'achievements', achievementId), {
        status,
        remarks,
        verifiedBy,
        verifiedByName,
        verificationDate: status !== AchievementStatus.PENDING ? Timestamp.now() : null,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating achievement:', error);
      throw error;
    }
  },

  // Delete achievement
  async deleteAchievement(achievementId: string, certificateUrl: string) {
    try {
      if (!storage) throw new Error('Cloud Storage not initialized');
      if (!db) throw new Error('Firestore database not initialized');
      if (certificateUrl) {
        const storageRef = ref(storage, certificateUrl);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, 'achievements', achievementId));
    } catch (error) {
      console.error('Error deleting achievement:', error);
      throw error;
    }
  },
};
