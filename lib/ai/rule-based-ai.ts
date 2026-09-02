import { AIActionItem, AIAnalysisResult } from '@/types/seo';
import { AuditDataForAI, AIProvider } from './ai-provider';

export class RuleBasedAIProvider implements AIProvider {
  name = 'Deterministic Rule-Based Engine';

  async generateRecommendations(data: AuditDataForAI): Promise<AIAnalysisResult> {
    const { score, technicalScore, onPageScore, contentScore, linksScore, issues, url, pagesCount } = data;

    const criticalIssues = issues.filter(i => i.severity === 'critical' && i.status === 'fail');
    const warningIssues = issues.filter(i => i.severity === 'warning' && (i.status === 'warning' || i.status === 'fail'));

    // Generate Executive Summary
    let grade = 'Good';
    if (score >= 90) grade = 'Excellent';
    else if (score >= 75) grade = 'Good';
    else if (score >= 50) grade = 'Needs Improvement';
    else grade = 'Critical Attention Required';

    const weakAreas: string[] = [];
    if (technicalScore < 70) weakAreas.push('Technical Infrastructure');
    if (onPageScore < 70) weakAreas.push('On-Page Metadata & Headings');
    if (contentScore < 70) weakAreas.push('Content Depth & Relevance');
    if (linksScore < 70) weakAreas.push('Internal Linking Structure');

    const weakSummary = weakAreas.length > 0
      ? `Primary focus should be directed towards ${weakAreas.join(', ')}.`
      : 'The website demonstrates solid foundational SEO health with opportunities for high-impact polish.';

    const summary = `SEO Health Score: ${score}/100 (${grade}). Audit evaluated ${pagesCount} crawled page(s) on ${url}. Identified ${criticalIssues.length} critical issue(s) and ${warningIssues.length} high-priority warning(s). ${weakSummary}`;

    // Build Prioritized Actions
    const priorityActions: AIActionItem[] = [];
    let priorityCounter = 1;

    // 1. Insecure HTTP
    const httpIssues = issues.filter(i => i.id.startsWith('tech-https'));
    if (httpIssues.length > 0) {
      priorityActions.push({
        priority: priorityCounter++,
        title: 'Enforce HTTPS Across All Pages',
        description: `${httpIssues.length} page(s) were served without SSL/TLS encryption. Search engines prioritize secure sites and flag unencrypted pages as insecure.`,
        impact: 'high',
        difficulty: 'easy',
        affectedPages: httpIssues.map(i => i.pageUrl).filter(Boolean).slice(0, 3).join(', ') || url,
        howToFix: 'Install a TLS certificate (e.g. via Let’s Encrypt) and configure permanent 301 redirects from HTTP to HTTPS in your web server or CDN settings.',
      });
    }

    // 2. Robots Disallow
    const robotsDisallow = issues.find(i => i.id === 'tech-robots-disallowed');
    if (robotsDisallow) {
      priorityActions.push({
        priority: priorityCounter++,
        title: 'Remove Accidental Site-Wide Disallow in robots.txt',
        description: 'Your robots.txt blocks all search crawlers from accessing and indexing your website pages.',
        impact: 'high',
        difficulty: 'easy',
        affectedPages: '/robots.txt',
        howToFix: 'Open your root robots.txt file and update "Disallow: /" to only disallow private admin directories or API endpoints.',
      });
    }

    // 3. Missing Title Tags
    const missingTitles = issues.filter(i => i.id.startsWith('onpage-title-missing'));
    if (missingTitles.length > 0) {
      priorityActions.push({
        priority: priorityCounter++,
        title: `Add Missing <title> Tags to ${missingTitles.length} Page(s)`,
        description: 'Pages without title tags cannot rank effectively because search engines rely on titles as the single strongest on-page relevance signal.',
        impact: 'high',
        difficulty: 'easy',
        affectedPages: missingTitles.map(i => i.pageUrl).filter(Boolean).slice(0, 3).join(', ') || 'Various pages',
        howToFix: 'Add a distinct, 30–60 character `<title>` tag inside the `<head>` of each affected page containing the target search query and brand name.',
      });
    }

    // 4. Broken Internal Links
    const brokenLinks = issues.filter(i => i.id.startsWith('links-broken-internal'));
    if (brokenLinks.length > 0) {
      priorityActions.push({
        priority: priorityCounter++,
        title: `Repair ${brokenLinks.length} Broken Internal Link(s)`,
        description: 'Internal links pointing to 404/500 errors waste crawler budget and create poor user experience.',
        impact: 'high',
        difficulty: 'easy',
        affectedPages: brokenLinks.map(i => i.pageUrl).filter(Boolean).slice(0, 3).join(', '),
        howToFix: 'Review the affected pages and replace broken destination URLs with live, working links or 301 redirects.',
      });
    }

    // 5. Missing Viewport Tag
    const missingViewport = issues.filter(i => i.id.startsWith('tech-viewport-') && i.status === 'fail');
    if (missingViewport.length > 0) {
      priorityActions.push({
        priority: priorityCounter++,
        title: 'Add Mobile Viewport Meta Tag',
        description: 'Pages without a viewport meta tag fail mobile-friendliness tests and render in desktop mode on smartphones.',
        impact: 'high',
        difficulty: 'easy',
        affectedPages: missingViewport.map(i => i.pageUrl).filter(Boolean).slice(0, 3).join(', '),
        howToFix: 'Add `<meta name="viewport" content="width=device-width, initial-scale=1.0">` inside the `<head>` of all HTML templates.',
      });
    }

    // 6. Missing Meta Descriptions
    const missingDesc = issues.filter(i => i.id.startsWith('onpage-desc-missing'));
    if (missingDesc.length > 0) {
      priorityActions.push({
        priority: priorityCounter++,
        title: `Write Meta Descriptions for ${missingDesc.length} Page(s)`,
        description: 'Meta descriptions determine the text snippet shown in Google search results. Missing descriptions lower click-through rates (CTR).',
        impact: 'medium',
        difficulty: 'easy',
        affectedPages: missingDesc.map(i => i.pageUrl).filter(Boolean).slice(0, 3).join(', '),
        howToFix: 'Craft unique 120–160 character meta descriptions summarizing each page’s core value with a clear call-to-action.',
      });
    }

    // 7. Missing Primary H1
    const missingH1 = issues.filter(i => i.id.startsWith('onpage-h1-missing'));
    if (missingH1.length > 0) {
      priorityActions.push({
        priority: priorityCounter++,
        title: `Add Primary <h1> Heading to ${missingH1.length} Page(s)`,
        description: 'The H1 heading informs readers and search engines of the main topic of the page.',
        impact: 'medium',
        difficulty: 'easy',
        affectedPages: missingH1.map(i => i.pageUrl).filter(Boolean).slice(0, 3).join(', '),
        howToFix: 'Include exactly one prominent `<h1>` heading at the top of your page content aligned with your primary keyword.',
      });
    }

    // 8. Missing Alt Attributes
    const missingAlt = issues.filter(i => i.id.startsWith('onpage-img-alt'));
    if (missingAlt.length > 0) {
      priorityActions.push({
        priority: priorityCounter++,
        title: 'Add Descriptive Alt Text to Informational Images',
        description: 'Images without alt attributes prevent screen readers from understanding visual assets and miss Google Image search traffic.',
        impact: 'medium',
        difficulty: 'easy',
        affectedPages: missingAlt.map(i => i.pageUrl).filter(Boolean).slice(0, 3).join(', '),
        howToFix: 'Add informative `alt="..."` attributes describing the image content. Use empty `alt=""` only for purely decorative graphics.',
      });
    }

    // 9. Thin Content
    const thinContent = issues.filter(i => i.id.startsWith('content-thin'));
    if (thinContent.length > 0) {
      priorityActions.push({
        priority: priorityCounter++,
        title: `Enrich Thin Content on ${thinContent.length} Page(s)`,
        description: 'Pages with less than 200 words often struggle to satisfy user intent and rank competitively.',
        impact: 'medium',
        difficulty: 'medium',
        affectedPages: thinContent.map(i => i.pageUrl).filter(Boolean).slice(0, 3).join(', '),
        howToFix: 'Expand the page content with detailed answers, case studies, FAQs, and practical explanations to thoroughly cover the subject.',
      });
    }

    // 10. Missing Sitemap
    const missingSitemap = issues.find(i => i.id === 'tech-sitemap-missing');
    if (missingSitemap) {
      priorityActions.push({
        priority: priorityCounter++,
        title: 'Generate and Submit XML Sitemap',
        description: 'An XML sitemap provides search engines an explicit map of all discoverable URLs and modification dates.',
        impact: 'medium',
        difficulty: 'easy',
        affectedPages: '/sitemap.xml',
        howToFix: 'Configure an automated XML sitemap generator in your CMS/framework and reference its URL in robots.txt and Google Search Console.',
      });
    }

    // 11. Missing Canonical Tags
    const missingCanonicals = issues.filter(i => i.id.startsWith('tech-canonical-missing-'));
    if (missingCanonicals.length > 0) {
      priorityActions.push({
        priority: priorityCounter++,
        title: `Add Canonical Tags to ${missingCanonicals.length} Page(s)`,
        description: 'Canonical tags prevent duplicate content indexing issues caused by URL tracking parameters or alternate URL variations.',
        impact: 'low',
        difficulty: 'easy',
        affectedPages: missingCanonicals.map(i => i.pageUrl).filter(Boolean).slice(0, 3).join(', '),
        howToFix: 'Add `<link rel="canonical" href="https://yourdomain.com/path">` to the `<head>` of each template.',
      });
    }

    // 12. Multiple H1s
    const multipleH1 = issues.filter(i => i.id.startsWith('onpage-h1-multiple-'));
    if (multipleH1.length > 0) {
      priorityActions.push({
        priority: priorityCounter++,
        title: 'Consolidate to a Single Primary <h1> per Page',
        description: `${multipleH1.length} page(s) have multiple <h1> headings, which dilutes topical hierarchy.`,
        impact: 'low',
        difficulty: 'easy',
        affectedPages: multipleH1.map(i => i.pageUrl).filter(Boolean).slice(0, 3).join(', '),
        howToFix: 'Keep the most important heading as `<h1>` and change secondary headings to `<h2>` or `<h3>`.',
      });
    }

    // Fallback if site is already super clean
    if (priorityActions.length === 0) {
      priorityActions.push({
        priority: 1,
        title: 'Maintain Regular Content Freshness & Structured Data',
        description: 'Your website demonstrates clean technical fundamentals. Continue maintaining fast page load speeds and semantic hierarchy.',
        impact: 'medium',
        difficulty: 'easy',
        affectedPages: url,
        howToFix: 'Implement Schema.org JSON-LD structured data (Article, Organization, BreadcrumbList) to qualify for rich snippets in Google search.',
      });
    }

    // Quick Wins (Easy difficulty + High/Medium impact)
    const quickWins = [
      'Add missing <title> and meta description tags to boost search snippet CTR.',
      'Ensure all informative <img> tags have descriptive alt text.',
      'Create a sitemap.xml and submit it to Google Search Console and Bing Webmaster Tools.',
      'Fix any broken internal links discovered during crawl.',
    ];

    const recommendations = [
      'Prioritize resolving all Critical Issues first to remove indexing blockers.',
      'Structure every page with a single H1, followed by logical H2 and H3 subheadings.',
      'Connect isolated pages with contextual internal links using descriptive anchor text.',
      'Keep title tags between 30-60 characters and meta descriptions between 120-160 characters.',
    ];

    return {
      summary,
      priorityActions: priorityActions.slice(0, 6),
      recommendations,
      quickWins,
    };
  }
}
