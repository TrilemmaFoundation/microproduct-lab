import {isIP} from 'node:net';

const LOCAL_HOST_SUFFIXES = ['.localhost', '.local', '.internal'];

export function validatePublicHttpsUrl(value) {
  let url;
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
  const ipCandidate = hostname.replace(/^\[|\]$/g, '');
  if (
    !hostname ||
    hostname === 'localhost' ||
    LOCAL_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix)) ||
    isIP(ipCandidate)
  ) {
    return 'must use a public hostname.';
  }

  return null;
}
