import { describe, it, expect } from 'vitest';
import { calculateSeoScores } from '../lib/scoring/score-calculator';
import { AuditIssue } from '../types/seo';

describe('SEO Scoring Calculator', () => {
  it('should return 100 for perfect clean issues', () => {
    const issues: AuditIssue[] = [
      { id: 't1', category: 'TECHNICAL', title: 'HTTPS', severity: 'info', status: 'pass', score: 100, description: '', recommendation: '' },
      { id: 'o1', category: 'ON_PAGE', title: 'Title', severity: 'info', status: 'pass', score: 100, description: '', recommendation: '' },
      { id: 'c1', category: 'CONTENT', title: 'Content', severity: 'info', status: 'pass', score: 100, description: '', recommendation: '' },
      { id: 'l1', category: 'LINKS', title: 'Links', severity: 'info', status: 'pass', score: 100, description: '', recommendation: '' },
    ];

    const result = calculateSeoScores(issues);
    expect(result.overallScore).toBe(100);
    expect(result.technicalScore).toBe(100);
    expect(result.onPageScore).toBe(100);
    expect(result.contentScore).toBe(100);
    expect(result.linksScore).toBe(100);
  });

  it('should calculate weighted category scores correctly (30% Tech, 30% OnPage, 25% Content, 15% Links)', () => {
    const issues: AuditIssue[] = [
      // Technical (Score: 0) -> 0 * 0.30 = 0
      { id: 't1', category: 'TECHNICAL', title: 'No HTTPS', severity: 'critical', status: 'fail', score: 0, description: '', recommendation: '' },
      // On-Page (Score: 100) -> 100 * 0.30 = 30
      { id: 'o1', category: 'ON_PAGE', title: 'Good Title', severity: 'info', status: 'pass', score: 100, description: '', recommendation: '' },
      // Content (Score: 100) -> 100 * 0.25 = 25
      { id: 'c1', category: 'CONTENT', title: 'Deep text', severity: 'info', status: 'pass', score: 100, description: '', recommendation: '' },
      // Links (Score: 100) -> 100 * 0.15 = 15
      { id: 'l1', category: 'LINKS', title: 'Good links', severity: 'info', status: 'pass', score: 100, description: '', recommendation: '' },
    ];

    const result = calculateSeoScores(issues);
    expect(result.technicalScore).toBe(0);
    expect(result.onPageScore).toBe(100);
    // Overall = 0*0.3 + 100*0.3 + 100*0.25 + 100*0.15 = 30 + 25 + 15 = 70
    expect(result.overallScore).toBe(70);
  });
});
