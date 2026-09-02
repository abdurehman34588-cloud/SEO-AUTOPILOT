import { httpRequest } from './http-client';

export interface SitemapInfo {
  exists: boolean;
  statusCode: number;
  urlCount: number;
  urls: string[];
  sitemapUrl: string;
}

/**
 * Checks sitemap.xml for the given domain or custom sitemap URL using robust HTTP client.
 */
export async function checkSitemap(origin: string, declaredSitemaps: string[] = []): Promise<SitemapInfo> {
  const candidateUrls = declaredSitemaps.length > 0 ? declaredSitemaps : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];

  for (const sitemapUrl of candidateUrls) {
    try {
      const res = await httpRequest(sitemapUrl, 6000);

      if (res.statusCode >= 200 && res.statusCode < 400 && res.body) {
        const text = res.body;
        const urls: string[] = [];

        // Extract <loc>...</loc> tags
        const locRegex = /<loc>(.*?)<\/loc>/gi;
        let match: RegExpExecArray | null;
        while ((match = locRegex.exec(text)) !== null && urls.length < 50) {
          const loc = match[1].trim();
          if (loc.startsWith('http')) {
            urls.push(loc);
          }
        }

        return {
          exists: true,
          statusCode: res.statusCode,
          urlCount: urls.length,
          urls,
          sitemapUrl,
        };
      }
    } catch {
      continue;
    }
  }

  return {
    exists: false,
    statusCode: 0,
    urlCount: 0,
    urls: [],
    sitemapUrl: candidateUrls[0] || `${origin}/sitemap.xml`,
  };
}
