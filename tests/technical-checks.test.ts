import { describe, it, expect } from 'vitest';
import { runTechnicalChecks } from '../lib/seo/technical-checks';
import { CrawledPage } from '../types/seo';

function createMockPage(overrides: Partial<CrawledPage> = {}): CrawledPage {
  return {
    id: 'test-p1',
    url: 'https://example.com',
    statusCode: 200,
    title: 'Title',
    metaDescription: 'Description',
    canonical: 'https://example.com',
    robotsMeta: 'index, follow',
    viewport: 'width=device-width, initial-scale=1',
    h1Count: 1,
    h1List: ['Heading'],
    h2Count: 1,
    h2List: ['Sub'],
    h3Count: 0,
    h3List: [],
    wordCount: 400,
    imageCount: 1,
    missingAltCount: 0,
    images: [],
    internalLinkCount: 2,
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

describe('Technical SEO Checks', () => {
  it('should flag missing robots.txt and sitemap.xml', () => {
    const page = createMockPage();
    const issues = runTechnicalChecks(
      [page],
      { exists: false, statusCode: 404, sitemaps: [], isAllowed: true },
      { exists: false, statusCode: 404, urlCount: 0, urls: [], sitemapUrl: 'https://example.com/sitemap.xml' }
    );

    expect(issues.some(i => i.id === 'tech-robots-missing')).toBe(true);
    expect(issues.some(i => i.id === 'tech-sitemap-missing')).toBe(true);
  });

  it('should flag insecure HTTP pages', () => {
    const page = createMockPage({ isHttps: false, url: 'http://example.com' });
    const issues = runTechnicalChecks(
      [page],
      { exists: true, statusCode: 200, sitemaps: [], isAllowed: true },
      { exists: true, statusCode: 200, urlCount: 5, urls: [], sitemapUrl: 'https://example.com/sitemap.xml' }
    );

    const httpIssue = issues.find(i => i.id.startsWith('tech-https'));
    expect(httpIssue).toBeDefined();
    expect(httpIssue?.severity).toBe('critical');
  });

  it('should flag missing mobile viewport', () => {
    const page = createMockPage({ viewport: null });
    const issues = runTechnicalChecks(
      [page],
      { exists: true, statusCode: 200, sitemaps: [], isAllowed: true },
      { exists: true, statusCode: 200, urlCount: 5, urls: [], sitemapUrl: 'https://example.com/sitemap.xml' }
    );

    const viewportIssue = issues.find(i => i.id.startsWith('tech-viewport-'));
    expect(viewportIssue).toBeDefined();
    expect(viewportIssue?.status).toBe('fail');
  });
});
