import { describe, it, expect } from 'vitest';
import { validateAndNormalizeUrl } from '../lib/security/url-validator';

describe('URL Validator & Normalizer', () => {
  it('should accept valid HTTPS and HTTP URLs', () => {
    const res1 = validateAndNormalizeUrl('https://example.com');
    expect(res1.isValid).toBe(true);
    expect(res1.normalizedUrl).toBe('https://example.com/');

    const res2 = validateAndNormalizeUrl('http://example.com/about');
    expect(res2.isValid).toBe(true);
    expect(res2.normalizedUrl).toBe('http://example.com/about');
  });

  it('should auto-prepend https:// when protocol is omitted', () => {
    const res = validateAndNormalizeUrl('example.com');
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe('https://example.com/');
  });

  it('should reject dangerous protocols (javascript:, file:, data:)', () => {
    const resJs = validateAndNormalizeUrl('javascript:alert(1)');
    expect(resJs.isValid).toBe(false);

    const resFile = validateAndNormalizeUrl('file:///etc/passwd');
    expect(resFile.isValid).toBe(false);

    const resData = validateAndNormalizeUrl('data:text/html,<h1>test</h1>');
    expect(resData.isValid).toBe(false);
  });

  it('should reject URLs with user credentials', () => {
    const res = validateAndNormalizeUrl('https://admin:password@example.com');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('credentials');
  });

  it('should strip fragments / hashes but preserve clean paths', () => {
    const res = validateAndNormalizeUrl('https://example.com/blog#section2');
    expect(res.isValid).toBe(true);
    expect(res.normalizedUrl).toBe('https://example.com/blog');
  });
});
