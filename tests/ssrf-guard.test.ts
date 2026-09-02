import { describe, it, expect } from 'vitest';
import { isPrivateOrReservedIP, isProhibitedHostname } from '../lib/security/ssrf-guard';

describe('SSRF Guard', () => {
  it('should detect IPv4 loopback (127.0.0.1)', () => {
    expect(isPrivateOrReservedIP('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIP('127.255.255.254')).toBe(true);
  });

  it('should detect RFC 1918 private IPv4 addresses', () => {
    expect(isPrivateOrReservedIP('10.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIP('172.16.0.1')).toBe(true);
    expect(isPrivateOrReservedIP('172.31.255.255')).toBe(true);
    expect(isPrivateOrReservedIP('192.168.1.1')).toBe(true);
  });

  it('should detect AWS/GCP cloud metadata IP (169.254.169.254)', () => {
    expect(isPrivateOrReservedIP('169.254.169.254')).toBe(true);
  });

  it('should allow public IPv4 addresses', () => {
    expect(isPrivateOrReservedIP('8.8.8.8')).toBe(false);
    expect(isPrivateOrReservedIP('93.184.216.34')).toBe(false);
    expect(isPrivateOrReservedIP('1.1.1.1')).toBe(false);
  });

  it('should detect prohibited hostnames (localhost, .internal, .local)', () => {
    expect(isProhibitedHostname('localhost')).toBe(true);
    expect(isProhibitedHostname('dev.localhost')).toBe(true);
    expect(isProhibitedHostname('service.internal')).toBe(true);
    expect(isProhibitedHostname('printer.local')).toBe(true);
    expect(isProhibitedHostname('metadata.google.internal')).toBe(true);
  });

  it('should allow valid public domain hostnames', () => {
    expect(isProhibitedHostname('example.com')).toBe(false);
    expect(isProhibitedHostname('google.com')).toBe(false);
    expect(isProhibitedHostname('sub.domain.org')).toBe(false);
  });
});
