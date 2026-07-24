import {validatePublicHttpsUrl} from '../publicHttpsUrl';

describe('validatePublicHttpsUrl', () => {
  it('accepts public HTTPS URLs', () => {
    expect(validatePublicHttpsUrl('https://docs.example.com/path?q=1#section')).toBeNull();
  });

  it('rejects unsafe or non-public URLs', () => {
    const invalidUrls = [
      'http://example.com',
      'javascript:alert(1)',
      'file:///etc/passwd',
      'https://user:password@example.com',
      'https://localhost',
      'https://docs.localhost',
      'https://service.local',
      'https://service.internal',
      'https://127.0.0.1',
      'https://[::1]',
      'https://169.254.169.254/latest/meta-data/',
      'not a URL',
    ];

    for (const value of invalidUrls) {
      expect(validatePublicHttpsUrl(value)).not.toBeNull();
    }
  });
});
