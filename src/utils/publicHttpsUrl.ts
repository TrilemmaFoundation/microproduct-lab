const LOCAL_HOST_SUFFIXES = ['.localhost', '.local', '.internal'] as const;

const IPV4_PATTERN =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

function looksLikeIpHostname(hostname: string): boolean {
  const candidate = hostname.replace(/^\[|\]$/g, '');
  if (IPV4_PATTERN.test(candidate)) {
    return true;
  }
  // IPv6 and other colon-form hostnames are not allowed as author profile hosts.
  return candidate.includes(':');
}

/** Returns an error message when the value is not a public HTTPS URL; otherwise null. */
export function validatePublicHttpsUrl(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return 'must be a valid URL.';
  }

  if (url.protocol !== 'https:') {
    return 'must use HTTPS.';
  }

  if (url.username || url.password) {
    return 'must not include credentials.';
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (
    hostname === 'localhost' ||
    LOCAL_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix)) ||
    looksLikeIpHostname(hostname)
  ) {
    return 'must use a public hostname.';
  }

  return null;
}
