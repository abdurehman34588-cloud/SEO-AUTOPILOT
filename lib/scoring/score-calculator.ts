import { AuditIssue, CategoryScoreBreakdown, CheckCategory } from '@/types/seo';

export interface AuditScores {
  overallScore: number;
  technicalScore: number;
  onPageScore: number;
  contentScore: number;
  linksScore: number;
  breakdown: Record<CheckCategory, CategoryScoreBreakdown>;
}

const CATEGORY_WEIGHTS: Record<CheckCategory, number> = {
  TECHNICAL: 0.30,
  ON_PAGE: 0.30,
  CONTENT: 0.25,
  LINKS: 0.15,
};

/**
 * Calculates category scores and the overall weighted SEO Health Score (0-100).
 */
export function calculateSeoScores(issues: AuditIssue[]): AuditScores {
  const categories: CheckCategory[] = ['TECHNICAL', 'ON_PAGE', 'CONTENT', 'LINKS'];

  const breakdown: Record<CheckCategory, CategoryScoreBreakdown> = {
    TECHNICAL: { score: 100, weight: 0.30, passed: 0, warnings: 0, failures: 0, totalChecks: 0 },
    ON_PAGE: { score: 100, weight: 0.30, passed: 0, warnings: 0, failures: 0, totalChecks: 0 },
    CONTENT: { score: 100, weight: 0.25, passed: 0, warnings: 0, failures: 0, totalChecks: 0 },
    LINKS: { score: 100, weight: 0.15, passed: 0, warnings: 0, failures: 0, totalChecks: 0 },
  };

  // Group issues by category
  for (const issue of issues) {
    const cat = issue.category;
    if (!breakdown[cat]) continue;

    breakdown[cat].totalChecks++;
    if (issue.status === 'pass') {
      breakdown[cat].passed++;
    } else if (issue.status === 'warning') {
      breakdown[cat].warnings++;
    } else if (issue.status === 'fail') {
      breakdown[cat].failures++;
    }
  }

  // Calculate score for each category
  for (const cat of categories) {
    const b = breakdown[cat];
    if (b.totalChecks === 0) {
      b.score = 100;
      continue;
    }

    // Average score of individual issues, with severity penalties
    const catIssues = issues.filter(i => i.category === cat);
    let totalScoreSum = 0;
    for (const issue of catIssues) {
      totalScoreSum += issue.score;
    }

    let calculated = Math.round(totalScoreSum / catIssues.length);
    // Ensure bounds
    b.score = Math.max(0, Math.min(100, calculated));
  }

  // Calculate overall weighted score
  const overall = Math.round(
    breakdown.TECHNICAL.score * CATEGORY_WEIGHTS.TECHNICAL +
    breakdown.ON_PAGE.score * CATEGORY_WEIGHTS.ON_PAGE +
    breakdown.CONTENT.score * CATEGORY_WEIGHTS.CONTENT +
    breakdown.LINKS.score * CATEGORY_WEIGHTS.LINKS
  );

  return {
    overallScore: Math.max(0, Math.min(100, overall)),
    technicalScore: breakdown.TECHNICAL.score,
    onPageScore: breakdown.ON_PAGE.score,
    contentScore: breakdown.CONTENT.score,
    linksScore: breakdown.LINKS.score,
    breakdown,
  };
}
