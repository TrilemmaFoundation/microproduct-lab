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
      sanitizeAuthor({
        id: 'a',
        name: 'A',
        bio: 'A short biography.',
        url: 'https://example.com',
      }),
    ).toEqual({
      id: 'a',
      name: 'A',
      bio: 'A short biography.',
      url: 'https://example.com',
    });
    expect(sanitizeAuthor({id: 'b', name: 'B'})).toEqual({id: 'b', name: 'B'});
    expect(sanitizeAuthor({id: 'blank', name: 'Blank', bio: ''})).toEqual({
      id: 'blank',
      name: 'Blank',
    });
    expect(
      sanitizeAuthor({id: 'c', name: 'C', url: 'javascript:alert(1)'}),
    ).toEqual({id: 'c', name: 'C'});
  });

  it('sanitizeAuthor omits non-string bios and does not invent missing fields', () => {
    expect(
      sanitizeAuthor({
        id: 'typed',
        name: 'Typed',
        bio: 12 as unknown as string,
      }),
    ).toEqual({id: 'typed', name: 'Typed'});
    expect(
      sanitizeAuthor({
        id: 'nulled',
        name: 'Nulled',
        bio: null as unknown as string,
        url: undefined,
      }),
    ).toEqual({id: 'nulled', name: 'Nulled'});
  });

  it('keeps optional live-registry bios only when they are non-empty strings', () => {
    for (const author of authors) {
      expect(author.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(author.name.trim().length).toBeGreaterThan(0);
      if (author.bio !== undefined) {
        expect(author.bio.trim().length).toBeGreaterThan(0);
      }
    }
    expect(new Set(authors.map((author) => author.id)).size).toBe(authors.length);
  });
});
