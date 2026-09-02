import { httpRequest } from './http-client';

export interface RobotsInfo {
  exists: boolean;
  statusCode: number;
  content?: string;
  sitemaps: string[];
  isAllowed: boolean;
}

/**
 * Checks robots.txt for the given target domain using robust HTTP client.
 */
export async function checkRobotsTxt(origin: string): Promise<RobotsInfo> {
  const robotsUrl = `${origin}/robots.txt`;
  try {
    const res = await httpRequest(robotsUrl, 6000);

    if (res.statusCode < 200 || res.statusCode >= 400) {
      return {
        exists: false,
        statusCode: res.statusCode,
        sitemaps: [],
        isAllowed: true,
      };
    }

    const text = res.body;
    const sitemaps: string[] = [];
    let isDisallowed = false;

    const lines = text.split('\n');
    let currentUserAgentApplies = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const [directive, ...valueParts] = line.split(':');
      const key = directive.trim().toLowerCase();
      const value = valueParts.join(':').trim();

      if (key === 'user-agent') {
        if (value === '*' || value.toLowerCase().includes('seo-autopilot')) {
          currentUserAgentApplies = true;
        } else {
          currentUserAgentApplies = false;
        }
      }

      if (key === 'sitemap' && value) {
        sitemaps.push(value);
      }

      if (currentUserAgentApplies && key === 'disallow') {
        if (value === '/' || value === '/*') {
          isDisallowed = true;
        }
      }
    }

    return {
      exists: true,
      statusCode: res.statusCode,
      content: text.substring(0, 2000),
      sitemaps,
      isAllowed: !isDisallowed,
    };
  } catch {
    return {
      exists: false,
      statusCode: 0,
      sitemaps: [],
      isAllowed: true,
    };
  }
}
