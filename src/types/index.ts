// Type definitions for the Student Achievement System

export enum UserRole {
  STUDENT = 'student',
  FACULTY = 'faculty',
  ADMIN = 'admin',
  VERIFICATION_TEAM = 'verification_team',
}

export enum AchievementStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  title: string;
  description: string;
  category: string;
  organizationName: string;
  eventDate: Date;
  certificateUrl?: string;
  certificateFileName?: string;
  certificateSize?: number;
  status: AchievementStatus;
  remarks?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verificationDate?: Date;
  department?: string;
  studentDepartment?: string;
  submittedAt: Date;
  updatedAt: Date;
  tags?: string[];
  isPublic?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalAchievements: number;
  approvedAchievements: number;
  pendingAchievements: number;
  rejectedAchievements: number;
  totalStudents: number;
  totalFaculty: number;
}
