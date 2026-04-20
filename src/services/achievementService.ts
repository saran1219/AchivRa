import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '@/config/firebase';
import { Achievement, AchievementStatus, SkillGroup } from '@/types';
import { sortAchievementsForVerificationQueue } from '@/utils/achievementPriority';

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
    tags: string[] = [],
    fileUrls: string[] = [],
    fileNames: string[] = [],
    skillGroup: string = SkillGroup.TECHNICAL
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
        skillGroup,
        organizationName,
        eventDate: Timestamp.fromDate(eventDate),
        certificateUrl: fileUrls.length > 0 ? fileUrls[0] : '', // Backward compatibility
        certificateFileName: fileNames.length > 0 ? fileNames[0] : '', // Backward compatibility
        fileUrls, // New field for multiple files
        fileNames, // New field for file names
        certificateSize: 0,
        status: AchievementStatus.PENDING,
        priority: 'normal',
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

  // Upload single certificate (Exact implementation requested by user)
  async uploadCertificate(file: File, userId: string) {
    try {
      if (!storage) throw new Error('Cloud Storage not initialized');
      const fileRef = ref(
        storage, 
        `certificates/${userId}/${Date.now()}_${file.name}`
      );

      console.log('Uploading file:', file.name);
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },

  // Upload multiple certificate files
  async uploadCertificates(
    achievementId: string, 
    studentId: string, 
    files: File[],
    onProgress?: (progress: number) => void
  ) {
    try {
      if (!storage) throw new Error('Cloud Storage not initialized');
      if (!db) throw new Error('Firestore database not initialized');
      
      const fileUrls: string[] = [];
      const fileNames: string[] = [];
      
      let totalBytes = files.reduce((sum, f) => sum + f.size, 0);
      let bytesTransferredSoFar = 0;

      for (const file of files) {
        if (!file) {
          alert('No file selected');
          throw new Error('No file selected');
        }

        const downloadURL = await this.uploadCertificate(file, studentId);
        fileUrls.push(downloadURL);
        fileNames.push(file.name);
        
        // Update progress manually
        bytesTransferredSoFar += file.size;
        if (onProgress) {
          onProgress((bytesTransferredSoFar / totalBytes) * 100);
        }
      }
      
      // Update achievement with files data
      await updateDoc(doc(db, 'achievements', achievementId), {
        certificateUrl: fileUrls.length > 0 ? fileUrls[0] : '',
        certificateFileName: fileNames.length > 0 ? fileNames[0] : '',
        fileUrls,
        fileNames,
        updatedAt: Timestamp.now(),
      });

      return fileUrls;
    } catch (error) {
      console.error('Error uploading certificates:', error);
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
      
      return sortAchievementsForVerificationQueue(achievements);
    } catch (error) {
      console.error('Error fetching pending achievements:', error);
      return [];
    }
  },

  // Get pending achievements for a specific department (for faculty verification)
  async getPendingAchievementsByDepartment(department: string): Promise<Achievement[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      const q = query(
        collection(db, 'achievements'),
        where('status', '==', AchievementStatus.PENDING),
        where('department', '==', department)
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
      
      return sortAchievementsForVerificationQueue(achievements);
    } catch (error) {
      console.error('Error fetching pending achievements by department:', error);
      return [];
    }
  },

  // Get all achievements
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      
      const q = query(collection(db, 'achievements'));
      const querySnapshot = await getDocs(q);
      const achievements = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        eventDate: doc.data().eventDate?.toDate() || new Date(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        verificationDate: doc.data().verificationDate?.toDate() || null,
      })) as Achievement[];
      
      return achievements.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  },

  // Update achievement status - STRICTLY for Verification Team
  async updateAchievementStatus(
    achievementId: string,
    status: AchievementStatus,
    remarks: string = '',
    verifiedBy: string = '',
    verifiedByName: string = '',
    verifierRole: string = '' // New parameter to check role (or just check in backend if we had a backend, here we rely on what's passed or logic in component + rules)
                              // note: The prompt says "Fetch current logged-in user profile", but in this service we don't have direct access to auth state hook.
                              // However, the caller usually passes this info. 
                              // BUT, to be "service layer" secure(ish) on client, we should check the role passed.
                              // Actually, the best way in client-side service is to check the role of the user performing the action.
                              // Since we can't easily get the user *inside* this static object without passing it, 
                              // I will update the signature to accept the role, OR assume the 'verifierRole' is passed.
                              // Wait, the prompt says "Fetch current logged-in user profile". 
                              // I can't do `useAuth` here. 
                              // I will assume the caller passes the role, or I fetch it from `userService` if possible, 
                              // but `userService` also needs uid.
                              // Let's stick to the prompt's spirit: "Check currentUser.role !== 'verification_team'".
                              // I will update the logic to check the role which I will require as a param or rely on the caller validation + Firestore rules.
                              // Actually, looking at the PART 3 of the prompt: 
                              // "Modify updateAchievementStatus function to: 1. Fetch current logged-in user profile... 2. Check if role !== verification_team"
                              // This implies I should try to get the user.
                              // I can import `auth` from firebase/auth? No, `useAuth` is a hook.
                              // I can use `auth.currentUser` from firebase config.
    
  ) {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      
      // We need to verify the user's role.
      // Since this is a client-side service, we can't trust client-side validation 100%, 
      // but the prompt asks for it here.
      // Firestore Rules (PART 4) is the real security.
      // Here we add the "Business Logic" check.
      
      // Let's get the current user from auth to get UID, then fetch their profile to get Role.
      // Imports needed:
      const { auth } = await import('@/config/firebase'); // Dynamic import to avoid cycles/init issues if any, or just import at top. 
      // Actually standard import is better. 
      
      const currentUser = auth?.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      // Fetch user profile to get role
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) throw new Error('User profile not found');
      
      const userData = userDoc.data();
      if (userData.role !== 'verification_team') {
        throw new Error('Only verification team can approve achievements');
      }

      // No department check anymore.
      
      await updateDoc(doc(db, 'achievements', achievementId), {
        status,
        remarks,
        verifiedBy: currentUser.uid,
        verifiedByName: userData.name || 'Verification Team',
        verificationDate: status !== AchievementStatus.PENDING ? Timestamp.now() : null,
        priority: 'normal',
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
