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
  }
};
