import https from 'https';
import http from 'http';
import zlib from 'zlib';
import { URL } from 'url';

export interface HttpResponse {
  url: string;
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
  responseTimeMs: number;
  isHttps: boolean;
  contentType: string;
}

const MAX_REDIRECTS = 5;
const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2MB safety cap

/**
 * Robust HTTP/HTTPS client that handles redirects, gzip compression,
 * enterprise TLS proxies, and timeout safety.
 */
export function httpRequest(
  targetUrl: string,
  timeoutMs = 8000,
  redirectCount = 0
): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    if (redirectCount > MAX_REDIRECTS) {
      return reject(new Error('Too many redirects'));
    }

    const startTime = Date.now();
    let urlObj: URL;
    try {
      urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
    } catch (e: any) {
      return reject(new Error(`Invalid URL: ${targetUrl}`));
    }

    const isHttps = urlObj.protocol === 'https:';
    const mod = isHttps ? https : http;

    const reqOptions: https.RequestOptions = {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: `${urlObj.pathname || '/'}${urlObj.search || ''}`,
      method: 'GET',
      rejectUnauthorized: false, // Allows crawling behind corporate TLS proxies without crashing
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 SEO-Autopilot/1.0',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'close',
      },
    };

    const req = mod.request(reqOptions, (res) => {
      const statusCode = res.statusCode || 200;
      const headers = res.headers;
      const contentType = (headers['content-type'] as string) || '';

      // Handle 3xx Redirects
      if (statusCode >= 300 && statusCode < 400 && headers.location) {
        try {
          const redirectUrl = new URL(headers.location, targetUrl).href;
          req.destroy();
          return resolve(httpRequest(redirectUrl, timeoutMs, redirectCount + 1));
        } catch {
          // If location is malformed, continue processing body
        }
      }

      // Stream & Decompress
      const contentEncoding = (headers['content-encoding'] as string || '').toLowerCase();
      let stream: NodeJS.ReadableStream = res;

      if (contentEncoding.includes('gzip')) {
        const gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        stream = gunzip;
      } else if (contentEncoding.includes('deflate')) {
        const inflate = zlib.createInflate();
        res.pipe(inflate);
        stream = inflate;
      } else if (contentEncoding.includes('br')) {
        const brotli = zlib.createBrotliDecompress();
        res.pipe(brotli);
        stream = brotli;
      }

      const chunks: Buffer[] = [];
      let totalBytes = 0;

      stream.on('data', (chunk: Buffer) => {
        totalBytes += chunk.length;
        if (totalBytes <= MAX_BODY_SIZE) {
          chunks.push(chunk);
        } else {
          // Truncate at max size
          req.destroy();
        }
      });

      stream.on('end', () => {
        const responseTimeMs = Date.now() - startTime;
        const bodyBuffer = Buffer.concat(chunks);
        const body = bodyBuffer.toString('utf-8');

        resolve({
          url: targetUrl,
          statusCode,
          headers,
          body,
          responseTimeMs,
          isHttps,
          contentType,
        });
      });

      stream.on('error', (err) => {
        const responseTimeMs = Date.now() - startTime;
        // Fallback to raw chunks if decompression failed
        const bodyBuffer = Buffer.concat(chunks);
        resolve({
          url: targetUrl,
          statusCode,
          headers,
          body: bodyBuffer.toString('utf-8'),
          responseTimeMs,
          isHttps,
          contentType,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    });

    req.end();
  });
}
