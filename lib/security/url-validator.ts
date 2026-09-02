import { z } from 'zod';
import { isProhibitedHostname } from './ssrf-guard';

export const urlSchema = z.string().trim().min(1, "Website URL is required");

export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  domain?: string;
  error?: string;
}

/**
 * Validates, checks for SSRF risks, and normalizes an input URL.
 */
export function validateAndNormalizeUrl(rawInput: string): UrlValidationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return { isValid: false, error: 'Please enter a valid website URL.' };
  }

  let trimmed = rawInput.trim();

  // Prepend https:// if protocol is omitted
  if (!/^https?:\/\//i.test(trimmed)) {
    // If it starts with javascript:, file:, data:, mailto:, ftp:, reject immediately
    if (/^(javascript|file|data|mailto|ftp|about|blob):/i.test(trimmed)) {
      return { isValid: false, error: 'Invalid URL protocol. Only HTTP and HTTPS websites are supported.' };
    }
    trimmed = 'https://' + trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, error: 'Malformed URL format. Please enter a valid web address (e.g., https://example.com).' };
  }

  // Protocol check: strictly http or https
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed.' };
  }

  // Username/Password in URL check
  if (parsed.username || parsed.password) {
    return { isValid: false, error: 'URLs with user credentials are not allowed for security reasons.' };
  }

  const hostname = parsed.hostname;

  // Check SSRF prohibitions
  if (isProhibitedHostname(hostname)) {
    return { isValid: false, error: 'Access to local, private, or internal network addresses is blocked for security.' };
  }

  // Ensure hostname has a valid dot (e.g. example.com) and is not just a single word unless it's a valid TLD
  if (!hostname.includes('.') || hostname.endsWith('.')) {
    return { isValid: false, error: 'Please enter a full domain name (e.g., example.com).' };
  }

  // Normalize: lower-case scheme and hostname, strip hash/fragment, remove default ports
  const normalizedProtocol = parsed.protocol.toLowerCase();
  const normalizedHostname = parsed.hostname.toLowerCase();
  let normalizedPort = parsed.port;
  if ((normalizedProtocol === 'http:' && normalizedPort === '80') || (normalizedProtocol === 'https:' && normalizedPort === '443')) {
    normalizedPort = '';
  }

  const portSuffix = normalizedPort ? `:${normalizedPort}` : '';
  let pathname = parsed.pathname || '/';
  
  // Clean up double slashes in pathname except protocol
  pathname = pathname.replace(/\/+/g, '/');

  // Strip trailing slash if it's the root path so example.com and example.com/ behave identically, or keep consistent
  const search = parsed.search; // keep query parameters if present

  const normalizedUrl = `${normalizedProtocol}//${normalizedHostname}${portSuffix}${pathname}${search}`;

  return {
    isValid: true,
    normalizedUrl,
    domain: normalizedHostname,
  };
}
