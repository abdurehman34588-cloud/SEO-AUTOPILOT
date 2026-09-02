import { AuditIssue, CrawledPage } from '@/types/seo';

/**
 * Runs On-Site Links SEO checks across the crawled page set.
 * Clearly labeled as on-site crawl sample analysis.
 */
export function runLinksChecks(pages: CrawledPage[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Build inbound internal link map
  const inboundLinkMap = new Map<string, number>();
  const pageUrlSet = new Set(pages.map(p => p.url));
  const pageStatusMap = new Map(pages.map(p => [p.url, p.statusCode]));

  for (const p of pages) {
    inboundLinkMap.set(p.url, 0);
  }

  for (const page of pages) {
    for (const link of page.internalLinks) {
      if (inboundLinkMap.has(link)) {
        inboundLinkMap.set(link, (inboundLinkMap.get(link) || 0) + 1);
      }
    }
  }

  // Site-wide overview issue
  const totalInternal = pages.reduce((acc, p) => acc + p.internalLinkCount, 0);
  const totalExternal = pages.reduce((acc, p) => acc + p.externalLinkCount, 0);

  issues.push({
    id: 'links-site-overview',
    category: 'LINKS',
    title: 'On-Site Link Profile Summary',
    severity: 'info',
    status: 'pass',
    score: 100,
    description: `Discovered ${totalInternal} internal links and ${totalExternal} external outbound links across ${pages.length} crawled pages. (Note: On-site link analysis based on crawled sample).`,
    recommendation: 'Maintain a coherent site architecture with descriptive anchor text linking related content.',
    evidence: `${totalInternal} internal links, ${totalExternal} outbound links`,
  });

  for (const page of pages) {
    // 1. Broken Internal Links in Crawled Sample
    const brokenInternalLinks: string[] = [];
    for (const link of page.internalLinks) {
      const status = pageStatusMap.get(link);
      if (status && status >= 400) {
        brokenInternalLinks.push(`${link} (${status})`);
      }
    }

    if (brokenInternalLinks.length > 0) {
      issues.push({
        id: `links-broken-internal-${page.id}`,
        category: 'LINKS',
        title: `Broken Internal Links Detected (${brokenInternalLinks.length})`,
        severity: 'critical',
        status: 'fail',
        score: 20,
        description: `This page contains ${brokenInternalLinks.length} internal link(s) leading to error status codes (4xx/5xx).`,
        recommendation: 'Update or remove links pointing to broken or non-existent URLs to prevent user friction and wasted crawl budget.',
        evidence: `Broken target(s): ${brokenInternalLinks.slice(0, 3).join(', ')}`,
        pageUrl: page.url,
        pageId: page.id,
      });
    }

    // 2. Orphan-like Pages (Excluding homepage / start page)
    const inboundCount = inboundLinkMap.get(page.url) ?? 0;
    const isHomePage = pages.length > 0 && pages[0].url === page.url;

    if (!isHomePage && inboundCount === 0 && pages.length > 1) {
      issues.push({
        id: `links-orphan-${page.id}`,
        category: 'LINKS',
        title: 'Orphan Page (No Discovered Internal Inbound Links)',
        severity: 'warning',
        status: 'warning',
        score: 60,
        description: 'No other crawled pages in the sample linked to this page. Orphan pages are difficult for search bots and visitors to discover.',
        recommendation: 'Add contextual internal links from your navigation, footer, or related articles to this page.',
        evidence: `Inbound internal links in sample: ${inboundCount}`,
        pageUrl: page.url,
        pageId: page.id,
      });
    }

    // 3. Low Internal Linking on Important Pages
    if (page.internalLinkCount === 0 && page.wordCount > 100) {
      issues.push({
        id: `links-no-outbound-internal-${page.id}`,
        category: 'LINKS',
        title: 'Zero Outbound Internal Links (Dead End)',
        severity: 'warning',
        status: 'warning',
        score: 65,
        description: 'This page has no links pointing to other pages on your website, acting as a navigational dead end.',
        recommendation: 'Add relevant internal links to related guides, products, or your homepage to keep visitors engaged.',
        evidence: '0 internal links from this page',
        pageUrl: page.url,
        pageId: page.id,
      });
    }
  }

  return issues;
}
