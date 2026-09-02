import { AuditIssue, CrawledPage } from '@/types/seo';

/**
 * Runs On-Page SEO checks across crawled pages.
 */
export function runOnPageChecks(pages: CrawledPage[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Track title and description occurrences for duplicate detection
  const titleMap = new Map<string, string[]>();
  const descMap = new Map<string, string[]>();

  for (const page of pages) {
    if (page.title) {
      const normalizedTitle = page.title.trim().toLowerCase();
      const list = titleMap.get(normalizedTitle) || [];
      list.push(page.url);
      titleMap.set(normalizedTitle, list);
    }
    if (page.metaDescription) {
      const normalizedDesc = page.metaDescription.trim().toLowerCase();
      const list = descMap.get(normalizedDesc) || [];
      list.push(page.url);
      descMap.set(normalizedDesc, list);
    }
  }

  for (const page of pages) {
    // 1. Title Tag Existence & Quality
    if (!page.title || page.title.trim().length === 0) {
      issues.push({
        id: `onpage-title-missing-${page.id}`,
        category: 'ON_PAGE',
        title: 'Missing Page Title Tag',
        severity: 'critical',
        status: 'fail',
        score: 0,
        description: 'The page is missing a `<title>` tag in the `<head>` section.',
        recommendation: 'Add a descriptive `<title>` tag (30 to 60 characters) summarizing the core topic of the page.',
        evidence: 'No <title> element found',
        pageUrl: page.url,
        pageId: page.id,
      });
    } else {
      const titleLen = page.title.trim().length;
      if (titleLen < 30) {
        issues.push({
          id: `onpage-title-short-${page.id}`,
          category: 'ON_PAGE',
          title: 'Title Tag Is Too Short',
          severity: 'warning',
          status: 'warning',
          score: 65,
          description: `The title tag is only ${titleLen} characters long. Search engines recommend titles between 30 and 60 characters for optimal click-through rates.`,
          recommendation: 'Expand your title tag with relevant keywords and unique value propositions.',
          evidence: `"${page.title}" (${titleLen} chars)`,
          pageUrl: page.url,
          pageId: page.id,
        });
      } else if (titleLen > 60) {
        issues.push({
          id: `onpage-title-long-${page.id}`,
          category: 'ON_PAGE',
          title: 'Title Tag Exceeds Recommended Length',
          severity: 'warning',
          status: 'warning',
          score: 70,
          description: `The title tag is ${titleLen} characters long and is likely to be truncated with an ellipsis in Google search results.`,
          recommendation: 'Shorten the title tag to under 60 characters so the full title remains visible in search snippets.',
          evidence: `"${page.title}" (${titleLen} chars)`,
          pageUrl: page.url,
          pageId: page.id,
        });
      } else {
        issues.push({
          id: `onpage-title-pass-${page.id}`,
          category: 'ON_PAGE',
          title: 'Optimal Title Tag Length',
          severity: 'info',
          status: 'pass',
          score: 100,
          description: `The title tag is ${titleLen} characters, which fits within the recommended 30-60 character range.`,
          recommendation: 'Maintain unique, high-intent titles across all pages.',
          evidence: `"${page.title}" (${titleLen} chars)`,
          pageUrl: page.url,
          pageId: page.id,
        });
      }

      // Duplicate Title Check
      const normalizedTitle = page.title.trim().toLowerCase();
      const duplicateUrls = titleMap.get(normalizedTitle) || [];
      if (duplicateUrls.length > 1) {
        issues.push({
          id: `onpage-title-dup-${page.id}`,
          category: 'ON_PAGE',
          title: 'Duplicate Title Tag Detected',
          severity: 'warning',
          status: 'warning',
          score: 50,
          description: 'This title tag is shared with other pages in your website.',
          recommendation: 'Each page should have a unique title tag to prevent keyword cannibalization and distinct search rankings.',
          evidence: `Used on ${duplicateUrls.length} pages: "${page.title}"`,
          pageUrl: page.url,
          pageId: page.id,
        });
      }
    }

    // 2. Meta Description Existence & Quality
    if (!page.metaDescription || page.metaDescription.trim().length === 0) {
      issues.push({
        id: `onpage-desc-missing-${page.id}`,
        category: 'ON_PAGE',
        title: 'Missing Meta Description',
        severity: 'critical',
        status: 'fail',
        score: 0,
        description: 'The page does not contain a `<meta name="description">` tag.',
        recommendation: 'Add a compelling meta description between 120 and 160 characters to improve search snippet click-through rates.',
        evidence: 'No meta description found',
        pageUrl: page.url,
        pageId: page.id,
      });
    } else {
      const descLen = page.metaDescription.trim().length;
      if (descLen < 70) {
        issues.push({
          id: `onpage-desc-short-${page.id}`,
          category: 'ON_PAGE',
          title: 'Meta Description Too Brief',
          severity: 'warning',
          status: 'warning',
          score: 70,
          description: `The meta description is only ${descLen} characters long. Standard search snippets display up to 160 characters.`,
          recommendation: 'Expand your meta description to 120-160 characters with clear call-to-actions and key benefits.',
          evidence: `"${page.metaDescription}" (${descLen} chars)`,
          pageUrl: page.url,
          pageId: page.id,
        });
      } else if (descLen > 160) {
        issues.push({
          id: `onpage-desc-long-${page.id}`,
          category: 'ON_PAGE',
          title: 'Meta Description Exceeds Recommended Limit',
          severity: 'warning',
          status: 'warning',
          score: 75,
          description: `The meta description is ${descLen} characters long and may get cut off on search engine results pages.`,
          recommendation: 'Trim the meta description to under 160 characters so your complete message is shown.',
          evidence: `"${page.metaDescription}" (${descLen} chars)`,
          pageUrl: page.url,
          pageId: page.id,
        });
      } else {
        issues.push({
          id: `onpage-desc-pass-${page.id}`,
          category: 'ON_PAGE',
          title: 'Well-Structured Meta Description',
          severity: 'info',
          status: 'pass',
          score: 100,
          description: `The meta description length is ${descLen} characters, optimal for search snippets.`,
          recommendation: 'Ensure descriptions are tailored to search intent and include relevant keywords.',
          evidence: `"${page.metaDescription}" (${descLen} chars)`,
          pageUrl: page.url,
          pageId: page.id,
        });
      }

      // Duplicate Meta Description Check
      const normalizedDesc = page.metaDescription.trim().toLowerCase();
      const duplicateDescUrls = descMap.get(normalizedDesc) || [];
      if (duplicateDescUrls.length > 1) {
        issues.push({
          id: `onpage-desc-dup-${page.id}`,
          category: 'ON_PAGE',
          title: 'Duplicate Meta Description',
          severity: 'warning',
          status: 'warning',
          score: 55,
          description: 'This meta description is identical to another page on your site.',
          recommendation: 'Write unique meta descriptions for every page to highlight distinct content.',
          evidence: `Shared across ${duplicateDescUrls.length} pages`,
          pageUrl: page.url,
          pageId: page.id,
        });
      }
    }

    // 3. Headings Structure (H1 and H2)
    if (page.h1Count === 0) {
      issues.push({
        id: `onpage-h1-missing-${page.id}`,
        category: 'ON_PAGE',
        title: 'Missing H1 Heading',
        severity: 'critical',
        status: 'fail',
        score: 0,
        description: 'The page has no `<h1>` heading tag to communicate the primary topic.',
        recommendation: 'Add a single, clear `<h1>` heading near the top of the page content.',
        evidence: '0 <h1> tags found',
        pageUrl: page.url,
        pageId: page.id,
      });
    } else if (page.h1Count > 1) {
      issues.push({
        id: `onpage-h1-multiple-${page.id}`,
        category: 'ON_PAGE',
        title: 'Multiple H1 Headings Detected',
        severity: 'warning',
        status: 'warning',
        score: 70,
        description: `The page contains ${page.h1Count} separate <h1> headings. While allowed in HTML5, having a single main H1 establishes a clearer document hierarchy for search engines.`,
        recommendation: 'Consolidate down to one primary `<h1>` heading and convert secondary headers to `<h2>` or `<h3>`.',
        evidence: `Found ${page.h1Count} H1 tags: ${page.h1List.slice(0, 3).map(h => `"${h}"`).join(', ')}`,
        pageUrl: page.url,
        pageId: page.id,
      });
    } else {
      issues.push({
        id: `onpage-h1-pass-${page.id}`,
        category: 'ON_PAGE',
        title: 'Single H1 Heading Present',
        severity: 'info',
        status: 'pass',
        score: 100,
        description: 'The page contains exactly one primary `<h1>` heading.',
        recommendation: 'Ensure your H1 aligns with the title tag and primary search query.',
        evidence: `<h1>${page.h1List[0] || 'Heading'}</h1>`,
        pageUrl: page.url,
        pageId: page.id,
      });
    }

    if (page.h2Count === 0 && page.wordCount > 200) {
      issues.push({
        id: `onpage-h2-missing-${page.id}`,
        category: 'ON_PAGE',
        title: 'No H2 Subheadings Found',
        severity: 'warning',
        status: 'warning',
        score: 75,
        description: 'The page contains body content but has no `<h2>` subheadings to break up sections.',
        recommendation: 'Use `<h2>` headings to organize your content into scannable, topical sections.',
        evidence: '0 <h2> tags found in body',
        pageUrl: page.url,
        pageId: page.id,
      });
    }

    // 4. Image Alt Attributes
    if (page.imageCount > 0) {
      if (page.missingAltCount > 0) {
        const missingPercent = Math.round((page.missingAltCount / page.imageCount) * 100);
        issues.push({
          id: `onpage-img-alt-${page.id}`,
          category: 'ON_PAGE',
          title: `Images Missing Alt Text (${page.missingAltCount}/${page.imageCount})`,
          severity: missingPercent > 50 ? 'critical' : 'warning',
          status: 'warning',
          score: Math.max(0, 100 - missingPercent),
          description: `${page.missingAltCount} out of ${page.imageCount} images (${missingPercent}%) on this page are missing descriptive alt attributes.`,
          recommendation: 'Add clear, descriptive alt text to all informative images for accessibility and image search indexing.',
          evidence: `${page.missingAltCount} image(s) lacking alt text`,
          pageUrl: page.url,
          pageId: page.id,
        });
      } else {
        issues.push({
          id: `onpage-img-alt-pass-${page.id}`,
          category: 'ON_PAGE',
          title: 'All Images Have Alt Attributes',
          severity: 'info',
          status: 'pass',
          score: 100,
          description: `All ${page.imageCount} images on this page include alt attributes.`,
          recommendation: 'Keep alt descriptions descriptive and avoid keyword stuffing.',
          evidence: `${page.imageCount} images checked`,
          pageUrl: page.url,
          pageId: page.id,
        });
      }
    }

    // 5. URL Length & Structure
    if (page.url.length > 100) {
      issues.push({
        id: `onpage-url-long-${page.id}`,
        category: 'ON_PAGE',
        title: 'Excessively Long URL',
        severity: 'warning',
        status: 'warning',
        score: 70,
        description: `This page URL is ${page.url.length} characters long. Shorter, cleaner URLs tend to perform better and are easier to share.`,
        recommendation: 'Structure URLs using concise, keyword-rich slugs without unnecessary parameters.',
        evidence: page.url,
        pageUrl: page.url,
        pageId: page.id,
      });
    }
  }

  return issues;
}
