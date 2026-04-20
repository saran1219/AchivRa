import { Achievement, AchievementStatus } from '@/types';

export interface YearlyTargetProgress {
  presentation: boolean;
  technicalCompetition: boolean;
  hackathon: boolean;
  allComplete: boolean;
}

function normalizeCategory(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Yearly faculty targets from approved achievements only.
 * Categories align with AchivRa defaults: Paper Presentation, Coding Competition, Hackathon.
 * "Technical competition" also matches Coding Competition-style entries.
 */
export function computeYearlyTargetProgress(achievements: Achievement[]): YearlyTargetProgress {
  const approved = achievements.filter((a) => a.status === AchievementStatus.APPROVED);

  let presentation = false;
  let technicalCompetition = false;
  let hackathon = false;

  for (const a of approved) {
    const c = normalizeCategory(a.category || '');
    if (!c) continue;

    if (c.includes('hackathon')) {
      hackathon = true;
    }
    if (c.includes('paper presentation') || c.includes('presentation')) {
      presentation = true;
    }
    if (c.includes('technical competition') || c.includes('coding competition')) {
      technicalCompetition = true;
    }
  }

  return {
    presentation,
    technicalCompetition,
    hackathon,
    allComplete: presentation && technicalCompetition && hackathon,
  };
}
