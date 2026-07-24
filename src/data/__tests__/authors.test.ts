import {
  authors,
  authorsById,
  sanitizeAuthor,
  sanitizeAuthorUrl,
} from '../authors';

describe('authors', () => {
  it('loads registry authors with public HTTPS profile URLs', () => {
    expect(authors.length).toBeGreaterThan(0);
    expect(authorsById.get('trilemma-foundation')?.url).toMatch(/^https:\/\//);
  });

  it('sanitizeAuthorUrl keeps public HTTPS URLs and drops unsafe values', () => {
    expect(sanitizeAuthorUrl('https://example.com/profile')).toBe(
      'https://example.com/profile',
    );
    expect(sanitizeAuthorUrl(undefined)).toBeUndefined();
    expect(sanitizeAuthorUrl('')).toBeUndefined();
    expect(sanitizeAuthorUrl('javascript:alert(1)')).toBeUndefined();
    expect(sanitizeAuthorUrl('http://example.com')).toBeUndefined();
    expect(sanitizeAuthorUrl('https://user:pass@example.com')).toBeUndefined();
  });

  it('sanitizeAuthor omits missing or unsafe URLs', () => {
    expect(
      sanitizeAuthor({id: 'a', name: 'A', url: 'https://example.com'}),
    ).toEqual({id: 'a', name: 'A', url: 'https://example.com'});
    expect(sanitizeAuthor({id: 'b', name: 'B'})).toEqual({id: 'b', name: 'B'});
    expect(
      sanitizeAuthor({id: 'c', name: 'C', url: 'javascript:alert(1)'}),
    ).toEqual({id: 'c', name: 'C'});
  });
});
