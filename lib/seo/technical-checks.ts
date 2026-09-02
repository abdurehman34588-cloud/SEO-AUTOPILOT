import { AuditIssue, CrawledPage } from '@/types/seo';
import { RobotsInfo } from '../crawler/robots';
import { SitemapInfo } from '../crawler/sitemap';

/**
 * Runs technical SEO checks on crawled pages and domain configurations.
 */
export function runTechnicalChecks(
  pages: CrawledPage[],
  robotsInfo: RobotsInfo,
  sitemapInfo: SitemapInfo
): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // 1. Robots.txt Check (Site-wide)
  if (!robotsInfo.exists) {
    issues.push({
      id: 'tech-robots-missing',
      category: 'TECHNICAL',
      title: 'Missing robots.txt File',
      severity: 'warning',
      status: 'warning',
      score: 50,
      description: 'The website does not have a publicly accessible robots.txt file at /robots.txt.',
      recommendation: 'Create a robots.txt file in the root directory to guide search engine crawlers and point to your sitemap.xml.',
      evidence: `HTTP status: ${robotsInfo.statusCode || 'Not found'}`,
    });
  } else if (!robotsInfo.isAllowed) {
    issues.push({
      id: 'tech-robots-disallowed',
      category: 'TECHNICAL',
      title: 'Site-wide Disallow in robots.txt',
      severity: 'critical',
      status: 'fail',
      score: 0,
      description: 'Your robots.txt contains a rule blocking search engines from indexing the entire website.',
      recommendation: 'Review your robots.txt Disallow directives and remove "Disallow: /" if you want your site indexed.',
      evidence: robotsInfo.content?.slice(0, 200) || 'Disallow: / found',
    });
  } else {
    issues.push({
      id: 'tech-robots-pass',
      category: 'TECHNICAL',
      title: 'Valid robots.txt File',
      severity: 'info',
      status: 'pass',
      score: 100,
      description: 'A valid robots.txt file is present and accessible to search engine crawlers.',
      recommendation: 'Ensure robots.txt is kept updated when adding new restricted sections.',
      evidence: 'robots.txt found and accessible',
    });
  }

  // 2. Sitemap.xml Check (Site-wide)
  if (!sitemapInfo.exists) {
    issues.push({
      id: 'tech-sitemap-missing',
      category: 'TECHNICAL',
      title: 'Missing XML Sitemap',
      severity: 'warning',
      status: 'warning',
      score: 40,
      description: 'No XML sitemap was found at standard locations (/sitemap.xml) or declared in robots.txt.',
      recommendation: 'Generate an XML sitemap and reference its location in your robots.txt file to help search engines discover all pages.',
      evidence: `Checked: ${sitemapInfo.sitemapUrl}`,
    });
  } else {
    issues.push({
      id: 'tech-sitemap-pass',
      category: 'TECHNICAL',
      title: 'XML Sitemap Detected',
      severity: 'info',
      status: 'pass',
      score: 100,
      description: `A valid XML sitemap was found containing ${sitemapInfo.urlCount > 0 ? `${sitemapInfo.urlCount}+` : 'indexed'} URLs.`,
      recommendation: 'Ensure your XML sitemap updates automatically when publishing new content.',
      evidence: sitemapInfo.sitemapUrl,
    });
  }

  // Page-specific Technical Checks
  for (const page of pages) {
    // 3. HTTPS Check
    if (!page.isHttps) {
      issues.push({
        id: `tech-https-${page.id}`,
        category: 'TECHNICAL',
        title: 'Insecure HTTP Connection',
        severity: 'critical',
        status: 'fail',
        score: 0,
        description: 'This page is being served over unencrypted HTTP rather than secure HTTPS.',
        recommendation: 'Install an SSL/TLS certificate and configure a 301 redirect from HTTP to HTTPS for all traffic.',
        evidence: `URL: ${page.url}`,
        pageUrl: page.url,
        pageId: page.id,
      });
    }

    // 4. Response Status Code Check
    if (page.statusCode >= 400) {
      issues.push({
        id: `tech-status-${page.id}`,
        category: 'TECHNICAL',
        title: `Page Returned HTTP Error (${page.statusCode})`,
        severity: page.statusCode === 404 ? 'warning' : 'critical',
        status: 'fail',
        score: 0,
        description: `The crawler encountered a ${page.statusCode} HTTP error when attempting to fetch this page.`,
        recommendation: page.statusCode === 404
          ? 'Fix broken links pointing to this missing URL or create a 301 redirect to relevant content.'
          : 'Inspect your web server logs to diagnose and resolve the server response error.',
        evidence: `HTTP Status: ${page.statusCode} for ${page.url}`,
        pageUrl: page.url,
        pageId: page.id,
      });
    }

    // 5. Mobile Viewport Check
    if (!page.viewport) {
      issues.push({
        id: `tech-viewport-${page.id}`,
        category: 'TECHNICAL',
        title: 'Missing Mobile Viewport Meta Tag',
        severity: 'critical',
        status: 'fail',
        score: 0,
        description: 'The page lacks a `<meta name="viewport">` tag, causing mobile browsers to render the page in desktop mode.',
        recommendation: 'Add `<meta name="viewport" content="width=device-width, initial-scale=1.0">` inside the `<head>` section.',
        evidence: 'No viewport meta tag found',
        pageUrl: page.url,
        pageId: page.id,
      });
    } else {
      issues.push({
        id: `tech-viewport-pass-${page.id}`,
        category: 'TECHNICAL',
        title: 'Mobile Viewport Configured',
        severity: 'info',
        status: 'pass',
        score: 100,
        description: 'A responsive mobile viewport meta tag is properly configured.',
        recommendation: 'Maintain responsive layout design across varying screen sizes.',
        evidence: page.viewport,
        pageUrl: page.url,
        pageId: page.id,
      });
    }

    // 6. Canonical Tag Check
    if (!page.canonical) {
      issues.push({
        id: `tech-canonical-missing-${page.id}`,
        category: 'TECHNICAL',
        title: 'Missing Canonical Tag',
        severity: 'warning',
        status: 'warning',
        score: 60,
        description: 'The page does not specify a canonical URL tag (`<link rel="canonical">`).',
        recommendation: 'Add a self-referencing canonical tag to avoid potential duplicate content penalties from query parameters.',
        evidence: 'No canonical link found in <head>',
        pageUrl: page.url,
        pageId: page.id,
      });
    } else {
      issues.push({
        id: `tech-canonical-pass-${page.id}`,
        category: 'TECHNICAL',
        title: 'Canonical Tag Present',
        severity: 'info',
        status: 'pass',
        score: 100,
        description: 'A canonical link element is correctly specified.',
        recommendation: 'Ensure the canonical link matches the preferred permanent URL.',
        evidence: `<link rel="canonical" href="${page.canonical}">`,
        pageUrl: page.url,
        pageId: page.id,
      });
    }

    // 7. Robots Meta Noindex Check
    if (page.robotsMeta && /noindex/i.test(page.robotsMeta)) {
      issues.push({
        id: `tech-noindex-${page.id}`,
        category: 'TECHNICAL',
        title: 'Page Marked as "noindex"',
        severity: 'warning',
        status: 'warning',
        score: 50,
        description: 'This page contains a "noindex" directive instructing search engines not to display it in search results.',
        recommendation: 'If this page is intended to be indexed, remove the "noindex" directive from the meta robots tag.',
        evidence: `Robots tag: ${page.robotsMeta}`,
        pageUrl: page.url,
        pageId: page.id,
      });
    }

    // 8. Server Response Time (TTFB approximation)
    if (page.responseTimeMs > 2000) {
      issues.push({
        id: `tech-slow-response-${page.id}`,
        category: 'TECHNICAL',
        title: 'Slow Server Response Time',
        severity: 'warning',
        status: 'warning',
        score: 55,
        description: `Server took ${page.responseTimeMs}ms to respond, which exceeds the recommended 600ms threshold.`,
        recommendation: 'Optimize server processing, enable edge caching (CDN), and investigate database query latency.',
        evidence: `Response time: ${page.responseTimeMs}ms`,
        pageUrl: page.url,
        pageId: page.id,
      });
    }
  }

  return issues;
}
