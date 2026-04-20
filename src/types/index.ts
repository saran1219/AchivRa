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

export enum SkillGroup {
  TECHNICAL = 'Technical',
  PROFESSIONAL = 'Professional',
  SOFT_SKILLS = 'Soft Skills',
}

export type AchievementPriorityLevel = 'normal' | 'high';

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
  /** High-level skill bucket for reporting (Technical, Professional, Soft Skills). */
  skillGroup?: SkillGroup | string;
  organizationName: string;
  eventDate: Date;
  certificateUrl?: string;
  certificateFileName?: string;
  certificateSize?: number;
  status: AchievementStatus;
  /** Queue hint: pending items older than 3 days are treated as high priority in UI. */
  priority?: AchievementPriorityLevel;
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
  fileUrls?: string[];
  fileNames?: string[];
}

export interface Notification {
  id: string;
  // Requested schema
  recipientId: string;
  message: string;
  type?: 'submission' | 'result' | string;
  status?: 'unread' | 'read' | string;
  createdAt: Date;

  // Optional richer fields (not required by spec, but used by some UI)
  title?: string;
  actionUrl?: string;
  relatedAchievementId?: string;
  relatedAchievementTitle?: string;
  priority?: string;

  // Legacy fields (kept so older documents/UI don't crash)
  userId?: string;
  role?: 'student' | 'verification_team' | string;
  read?: boolean;
  isRead?: boolean;
  readAt?: Date | null;
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
