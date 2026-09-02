import { describe, it, expect } from 'vitest';
import { runOnPageChecks } from '../lib/seo/on-page-checks';
import { CrawledPage } from '../types/seo';

function createMockPage(overrides: Partial<CrawledPage> = {}): CrawledPage {
  return {
    id: 'test-p1',
    url: 'https://example.com',
    statusCode: 200,
    title: 'Example Page - High Performance Web',
    metaDescription: 'A comprehensive guide to high performance web architecture and SEO best practices.',
    canonical: 'https://example.com',
    robotsMeta: 'index, follow',
    viewport: 'width=device-width, initial-scale=1',
    h1Count: 1,
    h1List: ['Main Heading'],
    h2Count: 2,
    h2List: ['Section 1', 'Section 2'],
    h3Count: 0,
    h3List: [],
    wordCount: 500,
    imageCount: 2,
    missingAltCount: 0,
    images: [{ src: '1.jpg', alt: 'Alt text', hasAlt: true, isAltEmpty: false }],
    internalLinkCount: 4,
    externalLinkCount: 1,
    internalLinks: [],
    externalLinks: [],
    responseTimeMs: 120,
    contentType: 'text/html',
    isHttps: true,
    hasRobotsTxt: true,
    hasSitemap: true,
    issues: [],
    ...overrides,
  };
}

describe('On-Page SEO Checks', () => {
  it('should flag missing title tags as critical fail', () => {
    const page = createMockPage({ title: null });
    const issues = runOnPageChecks([page]);
    const missingTitle = issues.find(i => i.id.startsWith('onpage-title-missing'));
    expect(missingTitle).toBeDefined();
    expect(missingTitle?.severity).toBe('critical');
    expect(missingTitle?.status).toBe('fail');
  });

  it('should flag short and long titles with warnings', () => {
    const shortPage = createMockPage({ title: 'Hi' });
    const shortIssues = runOnPageChecks([shortPage]);
    expect(shortIssues.some(i => i.id.startsWith('onpage-title-short'))).toBe(true);

    const longPage = createMockPage({
      title: 'This is an excessively long title that goes on and on and exceeds the sixty character threshold by a wide margin',
    });
    const longIssues = runOnPageChecks([longPage]);
    expect(longIssues.some(i => i.id.startsWith('onpage-title-long'))).toBe(true);
  });

  it('should detect duplicate title tags across multiple pages', () => {
    const p1 = createMockPage({ id: 'p1', url: 'https://example.com/page1', title: 'Identical Title' });
    const p2 = createMockPage({ id: 'p2', url: 'https://example.com/page2', title: 'Identical Title' });
    const issues = runOnPageChecks([p1, p2]);
    const dups = issues.filter(i => i.id.startsWith('onpage-title-dup'));
    expect(dups.length).toBe(2);
  });

  it('should flag missing meta descriptions as critical fail', () => {
    const page = createMockPage({ metaDescription: null });
    const issues = runOnPageChecks([page]);
    const missingDesc = issues.find(i => i.id.startsWith('onpage-desc-missing'));
    expect(missingDesc).toBeDefined();
    expect(missingDesc?.severity).toBe('critical');
    expect(missingDesc?.status).toBe('fail');
  });

  it('should flag multiple H1 tags and missing H1 tags', () => {
    const missingH1Page = createMockPage({ h1Count: 0, h1List: [] });
    const missingH1Issues = runOnPageChecks([missingH1Page]);
    expect(missingH1Issues.some(i => i.id.startsWith('onpage-h1-missing'))).toBe(true);

    const multiH1Page = createMockPage({ h1Count: 2, h1List: ['Heading 1', 'Heading 2'] });
    const multiH1Issues = runOnPageChecks([multiH1Page]);
    expect(multiH1Issues.some(i => i.id.startsWith('onpage-h1-multiple'))).toBe(true);
  });

  it('should flag images missing alt attributes', () => {
    const page = createMockPage({ imageCount: 5, missingAltCount: 3 });
    const issues = runOnPageChecks([page]);
    const altIssue = issues.find(i => i.id.startsWith('onpage-img-alt'));
    expect(altIssue).toBeDefined();
    expect(altIssue?.status).toBe('warning');
  });
});
