/**
 * Universal SSRF Guard (Pure JS / Browser & Server compatible without Node 'net' dependency).
 */

function isIPv4(ip: string): boolean {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (!match) return false;
  return match.slice(1).every((octet) => {
    const num = Number(octet);
    return num >= 0 && num <= 255;
  });
}

function isIPv6(ip: string): boolean {
  return /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(':');
}

/**
 * Checks whether an IP string is in a private, loopback, link-local, or reserved range.
 */
export function isPrivateOrReservedIP(ip: string): boolean {
  if (!ip) return true;

  // Check IPv4
  if (isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    const [a, b, c] = parts;

    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;

    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;

    // 10.0.0.0/8 (Private)
    if (a === 10) return true;

    // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
    if (a === 172 && b >= 16 && b <= 31) return true;

    // 192.168.0.0/16 (Private)
    if (a === 192 && b === 168) return true;

    // 169.254.0.0/16 (Link-local / AWS/GCP Metadata 169.254.169.254)
    if (a === 169 && b === 254) return true;

    // 100.64.0.0/10 (Carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;

    // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (Documentation)
    if (a === 192 && b === 0 && c === 2) return true;
    if (a === 198 && b === 51 && c === 100) return true;
    if (a === 203 && b === 0 && c === 113) return true;

    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
    if (a >= 224) return true;

    return false;
  }

  // Check IPv6
  if (isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // Loopback
    if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
    // Unspecified
    if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;
    // Unique Local (fc00::/7)
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // Link-local (fe80::/10)
    if (
      normalized.startsWith('fe8') ||
      normalized.startsWith('fe9') ||
      normalized.startsWith('fea') ||
      normalized.startsWith('feb')
    ) {
      return true;
    }
    // IPv4 mapped (::ffff:127.0.0.1 etc)
    if (normalized.startsWith('::ffff:')) {
      const ipv4Part = normalized.replace('::ffff:', '');
      return isPrivateOrReservedIP(ipv4Part);
    }
  }

  return false;
}

/**
 * Checks whether a hostname is prohibited (e.g. localhost, local domains, cloud metadata names).
 */
export function isProhibitedHostname(hostname: string): boolean {
  if (!hostname) return true;
  const lower = hostname.toLowerCase().trim();

  // Explicit localhost checks
  if (
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal') ||
    lower.endsWith('.lan') ||
    lower.endsWith('.home') ||
    lower.endsWith('.corp') ||
    lower.endsWith('.test') ||
    lower.endsWith('.invalid')
  ) {
    return true;
  }

  // Metadata service hostnames
  if (
    lower === 'metadata.google.internal' ||
    lower === '169.254.169.254' ||
    lower === 'instance-data'
  ) {
    return true;
  }

  // Check if hostname is an explicit private IP string
  if (isPrivateOrReservedIP(lower)) {
    return true;
  }

  return false;
}
