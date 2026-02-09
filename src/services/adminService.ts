import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AchievementCategory } from '@/types';

export const adminService = {
  // Get all categories
  async getCategories(): Promise<AchievementCategory[]> {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'categories')));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as AchievementCategory[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Add category
  async addCategory(name: string, slug: string, description: string, order: number = 0) {
    try {
      await addDoc(collection(db, 'categories'), {
        name,
        slug,
        description,
        icon: 'certificate',
        color: '#3b82f6',
        order,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  // Update category
  async updateCategory(categoryId: string, name: string, description: string) {
    try {
      await updateDoc(doc(db, 'categories', categoryId), {
        name,
        description,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(categoryId: string) {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      const achievementsSnapshot = await getDocs(collection(db, 'achievements'));
      const usersSnapshot = await getDocs(collection(db, 'users'));

      const achievements = achievementsSnapshot.docs.map((doc) => doc.data());
      const users = usersSnapshot.docs.map((doc) => doc.data());

      return {
        totalAchievements: achievements.length,
        approvedAchievements: achievements.filter((a) => a.status === 'approved').length,
        pendingAchievements: achievements.filter((a) => a.status === 'pending').length,
        rejectedAchievements: achievements.filter((a) => a.status === 'rejected').length,
        totalStudents: users.filter((u) => u.role === 'student').length,
        totalFaculty: users.filter((u) => u.role === 'faculty').length,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalAchievements: 0,
        approvedAchievements: 0,
        pendingAchievements: 0,
        rejectedAchievements: 0,
        totalStudents: 0,
        totalFaculty: 0,
      };
    }
  },
};
