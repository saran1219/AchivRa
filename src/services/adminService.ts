import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { AchievementCategory } from '@/types';

export const adminService = {
  // Get all categories
  async getCategories(): Promise<AchievementCategory[]> {
    try {
      if (!db) throw new Error('Firestore database not initialized');
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
      if (!db) throw new Error('Firestore database not initialized');
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
      if (!db) throw new Error('Firestore database not initialized');
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
      if (!db) throw new Error('Firestore database not initialized');
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Get dashboard statistics
  async getDashboardStats() {
    try {
      if (!db) throw new Error('Firestore database not initialized');
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

  // Get department statistics for faculty dashboard
  async getDepartmentStats(department: string) {
    try {
      if (!db) throw new Error('Firestore database not initialized');
      
      // Query users in department
      const usersQuery = query(collection(db, 'users'), where('department', '==', department), where('role', '==', 'student'));
      const usersSnapshot = await getDocs(usersQuery);
      const totalStudents = usersSnapshot.size;

      // Query achievements in department
      // We fetch ALL achievements for the department to avoid compound index issues with multiple filters
      // and to ensure we have all data for accurate client-side calculation.
      console.log(`Fetching stats for department: "${department}"`);
      const achievementsQuery = query(collection(db, 'achievements'), where('department', '==', department));
      const achievementsSnapshot = await getDocs(achievementsQuery);
      
      console.log(`Found ${achievementsSnapshot.size} achievements for ${department}`);

      const achievements = achievementsSnapshot.docs.map(doc => {
        const data = doc.data();
        // Normalize fields if necessary (though we trust Firestore for now, logging helps)
        return {
          id: doc.id,
          ...data,
          eventDate: data.eventDate?.toDate() || new Date(),
          submittedAt: data.submittedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          verificationDate: data.verificationDate?.toDate() || null,
        };
      }) as any[];

      // Calculate aggregated stats
      const totalAchievements = achievements.length;
      const approved = achievements.filter(a => a.status === 'approved');
      const pending = achievements.filter(a => a.status === 'pending');
      const rejected = achievements.filter(a => a.status === 'rejected');

      // 1. Category Breakdown
      const categoryBreakdown: { [key: string]: number } = {};
      achievements.forEach(a => {
        const cat = a.category || 'Other';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      });

      // 2. Recent Approved Achievements (Limit 5)
      // Sort by verificationDate desc, then submittedAt desc
      const recentApproved = approved
        .sort((a, b) => {
          const dateA = a.verificationDate || a.updatedAt;
          const dateB = b.verificationDate || b.updatedAt;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          studentName: a.studentName,
          title: a.title,
          category: a.category,
          date: a.verificationDate || a.updatedAt,
        }));

      // 3. Approval Rate
      const approvalRate = totalAchievements > 0 
        ? Math.round((approved.length / totalAchievements) * 100) 
        : 0;

      return {
        totalStudents,
        totalAchievements,
        approvedAchievements: approved.length,
        pendingAchievements: pending.length,
        rejectedAchievements: rejected.length,
        categoryBreakdown,
        recentApproved,
        approvalRate,
      };
    } catch (error) {
      console.error('Error fetching department stats:', error);
      return {
        totalStudents: 0,
        totalAchievements: 0,
        approvedAchievements: 0,
        pendingAchievements: 0,
        rejectedAchievements: 0,
        categoryBreakdown: {},
        recentApproved: [],
        approvalRate: 0,
      };
    }
  },
};
