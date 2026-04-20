import { Achievement } from '@/types';

export type TargetScope = 'yearly' | 'semester';

/**
 * Yearly: submissions in the current calendar year (by submittedAt).
 * Semester: Jan 1–Jun 30 or Jul 1–Dec 31 of the current calendar year.
 */
export function filterAchievementsByTargetScope(
  achievements: Achievement[],
  scope: TargetScope,
  referenceDate: Date = new Date()
): Achievement[] {
  const y = referenceDate.getFullYear();
  const m = referenceDate.getMonth();

  let start: Date;
  let end: Date;

  if (scope === 'yearly') {
    start = new Date(y, 0, 1);
    end = new Date(y, 11, 31, 23, 59, 59, 999);
  } else {
    if (m <= 5) {
      start = new Date(y, 0, 1);
      end = new Date(y, 5, 30, 23, 59, 59, 999);
    } else {
      start = new Date(y, 6, 1);
      end = new Date(y, 11, 31, 23, 59, 59, 999);
    }
  }

  const t0 = start.getTime();
  const t1 = end.getTime();

  return achievements.filter((a) => {
    const t = new Date(a.submittedAt).getTime();
    return t >= t0 && t <= t1;
  });
}
