import * as cheerio from 'cheerio';
import { CrawledPage, ExtractedImage, ExtractedLink } from '@/types/seo';
import { validateAndNormalizeUrl } from '../security/url-validator';
import { isProhibitedHostname } from '../security/ssrf-guard';
import { httpRequest } from './http-client';

export interface CrawlerOptions {
  maxPages?: number;
  maxDepth?: number;
  timeoutMs?: number;
  onProgress?: (progress: { crawled: number; currentUrl: string; stage: string }) => void;
}

const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2MB cap
const IGNORED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|ico|pdf|zip|tar|gz|exe|mp4|webm|mp3|wav|css|js|woff|woff2|ttf|eot)$/i;

/**
 * Fetches a single page and extracts real SEO data using Cheerio.
 */
export async function fetchAndParsePage(url: string, timeoutMs = 8000): Promise<CrawledPage> {
  const startTime = Date.now();
  const pageId = Math.random().toString(36).substring(2, 9);
  const isHttps = url.startsWith('https://');

  try {
    const httpRes = await httpRequest(url, timeoutMs);
    const responseTimeMs = httpRes.responseTimeMs;
    const contentType = httpRes.contentType;
    const statusCode = httpRes.statusCode;
    const html = httpRes.body || '';

    const isHtml =
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml+xml') ||
      html.includes('<html') ||
      html.includes('<!DOCTYPE') ||
      html.includes('<!doctype') ||
      html.includes('<head') ||
      html.includes('<body');

    if (!isHtml && statusCode !== 200) {
      return {
        id: pageId,
        url,
        statusCode,
        title: null,
        metaDescription: null,
        canonical: null,
        robotsMeta: null,
        viewport: null,
        h1Count: 0,
        h1List: [],
        h2Count: 0,
        h2List: [],
        h3Count: 0,
        h3List: [],
        wordCount: 0,
        imageCount: 0,
        missingAltCount: 0,
        images: [],
        internalLinkCount: 0,
        externalLinkCount: 0,
        internalLinks: [],
        externalLinks: [],
        responseTimeMs,
        contentType,
        isHttps: httpRes.isHttps,
        hasRobotsTxt: false,
        hasSitemap: false,
        issues: [],
      };
    }

    const truncatedHtml = html.length > MAX_BODY_SIZE ? html.substring(0, MAX_BODY_SIZE) : html;
    const $ = cheerio.load(truncatedHtml);

    // Title
    const titleTag = $('title').first().text().trim();
    const ogTitle = $('meta[property="og:title" i]').attr('content')?.trim();
    const title = titleTag.length > 0 ? titleTag : ogTitle || null;

    // Meta Description
    const metaDesc =
      $('meta[name="description" i]').attr('content') ||
      $('meta[property="og:description" i]').attr('content') ||
      null;
    const metaDescription = metaDesc ? metaDesc.trim() : null;

    // Canonical
    const canonical = $('link[rel="canonical" i]').attr('href') || null;

    // Robots Meta
    const robotsMeta =
      $('meta[name="robots" i]').attr('content') ||
      $('meta[name="googlebot" i]').attr('content') ||
      null;

    // Viewport
    const viewport = $('meta[name="viewport" i]').attr('content') || null;

    // Headings
    const h1List: string[] = [];
    $('h1').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) h1List.push(text);
    });

    const h2List: string[] = [];
    $('h2').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) h2List.push(text);
    });

    const h3List: string[] = [];
    $('h3').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text) h3List.push(text);
    });

    // Images
    const images: ExtractedImage[] = [];
    let missingAltCount = 0;
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      const alt = $(el).attr('alt');
      const hasAlt = typeof alt === 'string';
      const isAltEmpty = hasAlt && alt.trim() === '';

      if (!hasAlt || isAltEmpty) {
        missingAltCount++;
      }

      if (src && images.length < 50) {
        images.push({
          src,
          alt: alt || '',
          hasAlt,
          isAltEmpty,
        });
      }
    });

    // Links
    const internalLinks: string[] = [];
    const externalLinks: string[] = [];
    const targetUrlObj = new URL(url);
    const origin = targetUrlObj.origin;
    const targetDomain = targetUrlObj.hostname.replace(/^www\./i, '');

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')?.trim();
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }

      try {
        const resolved = new URL(href, origin);
        // Only accept http/https
        if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return;

        const resolvedDomain = resolved.hostname.replace(/^www\./i, '');

        if (resolvedDomain === targetDomain) {
          const normalized = resolved.origin + resolved.pathname;
          if (!IGNORED_EXTENSIONS.test(normalized) && !internalLinks.includes(normalized)) {
            internalLinks.push(normalized);
          }
        } else {
          if (!externalLinks.includes(resolved.href) && externalLinks.length < 50) {
            externalLinks.push(resolved.href);
          }
        }
      } catch {
        // Invalid link format
      }
    });

    // Word Count & Raw Text
    const $clone = cheerio.load(truncatedHtml);
    $clone('script, style, noscript, svg, nav, footer, header').remove();
    const rawText = $clone('body').text().replace(/\s+/g, ' ').trim();
    const words = rawText.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;

    return {
      id: pageId,
      url,
      statusCode,
      title,
      metaDescription,
      canonical: canonical ? canonical.trim() : null,
      robotsMeta: robotsMeta ? robotsMeta.trim() : null,
      viewport: viewport ? viewport.trim() : null,
      h1Count: $('h1').length,
      h1List,
      h2Count: $('h2').length,
      h2List,
      h3Count: $('h3').length,
      h3List,
      wordCount,
      imageCount: $('img').length,
      missingAltCount,
      images,
      internalLinkCount: internalLinks.length,
      externalLinkCount: externalLinks.length,
      internalLinks,
      externalLinks,
      responseTimeMs,
      contentType,
      isHttps: httpRes.isHttps,
      hasRobotsTxt: false,
      hasSitemap: false,
      rawText: rawText.substring(0, 3000),
      issues: [],
    };
  } catch (err: unknown) {
    const responseTimeMs = Date.now() - startTime;
    const isAbort = (err as Error)?.name === 'AbortError';

    return {
      id: pageId,
      url,
      statusCode: isAbort ? 408 : 500,
      title: null,
      metaDescription: null,
      canonical: null,
      robotsMeta: null,
      viewport: null,
      h1Count: 0,
      h1List: [],
      h2Count: 0,
      h2List: [],
      h3Count: 0,
      h3List: [],
      wordCount: 0,
      imageCount: 0,
      missingAltCount: 0,
      images: [],
      internalLinkCount: 0,
      externalLinkCount: 0,
      internalLinks: [],
      externalLinks: [],
      responseTimeMs,
      contentType: null,
      isHttps,
      hasRobotsTxt: false,
      hasSitemap: false,
      issues: [],
    };
  }
}

/**
 * Crawls a website starting from the target URL up to maxPages and maxDepth.
 */
export async function crawlWebsite(
  targetUrl: string,
  options: CrawlerOptions = {}
): Promise<{ pages: CrawledPage[]; errors: string[] }> {
  const maxPages = options.maxPages || 10;
  const maxDepth = options.maxDepth || 2;
  const timeoutMs = options.timeoutMs || 8000;

  const validation = validateAndNormalizeUrl(targetUrl);
  if (!validation.isValid || !validation.normalizedUrl) {
    throw new Error(validation.error || 'Invalid starting URL');
  }

  const startUrl = validation.normalizedUrl;
  const startUrlObj = new URL(startUrl);
  const startDomain = startUrlObj.hostname.replace(/^www\./i, '');

  const crawledPages: CrawledPage[] = [];
  const errors: string[] = [];
  const visitedUrls = new Set<string>();

  // Queue of { url: string, depth: number }
  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
  visitedUrls.add(startUrl);

  while (queue.length > 0 && crawledPages.length < maxPages) {
    const current = queue.shift();
    if (!current) break;

    // Safety check on hostname
    try {
      const currObj = new URL(current.url);
      const currDomain = currObj.hostname.replace(/^www\./i, '');

      if (currDomain !== startDomain || isProhibitedHostname(currObj.hostname)) {
        continue;
      }
    } catch {
      continue;
    }

    if (options.onProgress) {
      options.onProgress({
        crawled: crawledPages.length + 1,
        currentUrl: current.url,
        stage: `Crawling ${current.url}`,
      });
    }

    const pageData = await fetchAndParsePage(current.url, timeoutMs);
    crawledPages.push(pageData);

    if (pageData.statusCode >= 400) {
      errors.push(`Page ${current.url} returned status code ${pageData.statusCode}`);
    }

    // Discover internal links if depth < maxDepth
    if (current.depth < maxDepth && crawledPages.length < maxPages) {
      for (const internalLink of pageData.internalLinks) {
        if (!visitedUrls.has(internalLink) && crawledPages.length + queue.length < maxPages * 2) {
          visitedUrls.add(internalLink);
          queue.push({ url: internalLink, depth: current.depth + 1 });
        }
      }
    }
  }

  return { pages: crawledPages, errors };
}
