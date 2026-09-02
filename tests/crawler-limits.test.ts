import { describe, it, expect } from 'vitest';
import { RuleBasedAIProvider } from '../lib/ai/rule-based-ai';
import { AuditIssue, CrawledPage } from '../types/seo';

describe('AI Recommendation Engine (Rule-Based)', () => {
  it('should generate prioritized actions without external API keys', async () => {
    const provider = new RuleBasedAIProvider();
    const issues: AuditIssue[] = [
      {
        id: 'onpage-title-missing-p1',
        category: 'ON_PAGE',
        title: 'Missing Page Title Tag',
        severity: 'critical',
        status: 'fail',
        score: 0,
        description: 'Page title is missing',
        recommendation: 'Add a 30-60 char title',
        pageUrl: 'https://example.com/blog',
      },
      {
        id: 'links-broken-internal-p1',
        category: 'LINKS',
        title: 'Broken Internal Links Detected (1)',
        severity: 'critical',
        status: 'fail',
        score: 20,
        description: 'Links to broken url',
        recommendation: 'Fix the broken link',
        pageUrl: 'https://example.com/about',
      },
    ];

    const result = await provider.generateRecommendations({
      url: 'https://example.com',
      score: 55,
      technicalScore: 80,
      onPageScore: 40,
      contentScore: 70,
      linksScore: 30,
      pagesCount: 2,
      issues,
      pages: [],
    });

    expect(result.summary).toBeDefined();
    expect(result.priorityActions.length).toBeGreaterThan(0);
    expect(result.priorityActions[0].priority).toBe(1);
    expect(result.quickWins.length).toBeGreaterThan(0);
  });
});
