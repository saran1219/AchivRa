import { Achievement, AchievementStatus } from '@/types';

const STALE_PENDING_MS = 3 * 24 * 60 * 60 * 1000;

/** Pending longer than 3 days counts as high priority for queue ordering. */
export function isStaleHighPriorityPending(a: Achievement): boolean {
  if (a.status !== AchievementStatus.PENDING) return false;
  const submitted = new Date(a.submittedAt).getTime();
  return Date.now() - submitted > STALE_PENDING_MS;
}

/** Effective priority for display (stored field respected if already high; else derived). */
export function getEffectivePriority(a: Achievement): 'high' | 'normal' {
  if (a.status !== AchievementStatus.PENDING) return 'normal';
  if (a.priority === 'high' || isStaleHighPriorityPending(a)) return 'high';
  return 'normal';
}

/** Verification / faculty pending lists: high-priority stale pending first, then newest first. */
export function sortAchievementsForVerificationQueue(items: Achievement[]): Achievement[] {
  return [...items].sort((a, b) => compareForVerificationQueue(a, b, 'newest'));
}

/** Pending items first; stale pending before fresher pending; then date order. */
export function compareForVerificationQueue(
  a: Achievement,
  b: Achievement,
  sortOrder: 'newest' | 'oldest'
): number {
  if (a.status === AchievementStatus.PENDING && b.status !== AchievementStatus.PENDING) return -1;
  if (a.status !== AchievementStatus.PENDING && b.status === AchievementStatus.PENDING) return 1;
  if (a.status === AchievementStatus.PENDING && b.status === AchievementStatus.PENDING) {
    const highA = isStaleHighPriorityPending(a) ? 1 : 0;
    const highB = isStaleHighPriorityPending(b) ? 1 : 0;
    if (highA !== highB) return highB - highA;
  }
  const dateA = new Date(a.submittedAt).getTime();
  const dateB = new Date(b.submittedAt).getTime();
  return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
}
