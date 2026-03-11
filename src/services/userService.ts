import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { UserRole } from '@/types';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  joinedDate?: any; // Timestamp
  photoURL?: string;
  skills?: string[];
}

export const userService = {
  // Get all students
  async getAllStudents(): Promise<UserProfile[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      
      const studentsQuery = query(
        collection(db, 'users'), 
        where('role', '==', UserRole.STUDENT)
      );
      
      const snapshot = await getDocs(studentsQuery);
      
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  // Get students by department
  async getStudentsByDepartment(department: string): Promise<UserProfile[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      
      const studentsQuery = query(
        collection(db, 'users'), 
        where('role', '==', UserRole.STUDENT),
        where('department', '==', department)
      );
      
      const snapshot = await getDocs(studentsQuery);
      
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (error) {
      console.error('Error fetching students by department:', error);
      return [];
    }
  },

  // Get student by ID
  async getStudentById(uid: string): Promise<UserProfile | null> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      
      const { doc: firestoreDoc, getDoc } = await import('firebase/firestore');
      const docRef = firestoreDoc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().role === UserRole.STUDENT) {
        return {
          uid: docSnap.id,
          ...docSnap.data()
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      return null;
    }
  },

  // Update user skills
  async updateUserSkills(uid: string, skills: string[]): Promise<void> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      const { doc: firestoreDoc, updateDoc } = await import('firebase/firestore');
      const docRef = firestoreDoc(db, 'users', uid);
      await updateDoc(docRef, { skills });
    } catch (error) {
      console.error('Error updating user skills:', error);
      throw error;
    }
  }
};
