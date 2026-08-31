import type {AllContent} from '@docusaurus/types';
import type {DocMetadata} from '@docusaurus/plugin-content-docs';
import type {Author} from '../authors';
import {buildAuthorPageData} from '../authorPages';

const authors: Author[] = [
  {id: 'ada', name: 'Ada', bio: 'Writes about data.', url: 'https://example.com/ada'},
  {id: 'no-articles', name: 'No Articles'},
  {id: 'grace', name: 'Grace'},
];

function doc(
  title: string,
  permalink: string,
  lastReviewed: string,
  authorIds: unknown,
  overrides: Partial<DocMetadata> = {},
): DocMetadata {
  return {
    title,
    description: `${title} description`,
    permalink,
    draft: false,
    unlisted: false,
    frontMatter: {authors: authorIds, last_reviewed: lastReviewed},
    ...overrides,
  } as DocMetadata;
}

function allContent(docs: DocMetadata[]): AllContent {
  return {
    'docusaurus-plugin-content-docs': {
      default: {
        loadedVersions: [{docs}],
      },
    },
  };
}

describe('buildAuthorPageData', () => {
  it('builds de-duplicated, reverse-chronological article lists from every docs plugin', () => {
    const extraDocs = [
      doc('Earlier', '/archetypes/earlier', '2026-08-20', ['ada']),
      doc('Later B', '/docs/later-b', '2026-08-25', ['ada']),
      doc('Later A', '/docs/later-a', '2026-08-25', ['ada']),
      doc('Same title', '/docs/same-title-b', '2026-08-25', ['ada']),
      doc('Same title', '/docs/same-title-a', '2026-08-25', ['ada']),
    ];
    const content = allContent([
      doc('Duplicate', '/docs/duplicate', '2026-08-19', ['ada']),
      ...extraDocs,
    ]);
    content['docusaurus-plugin-content-docs'].archetypes = {
      loadedVersions: [{docs: [extraDocs[0], doc('Duplicate', '/docs/duplicate', '2026-08-19', ['ada'])]}],
    };

    const [ada, empty, grace] = buildAuthorPageData(content, authors);

    expect(ada).toEqual({
      ...authors[0],
      articles: [
        {
          title: 'Later A',
          description: 'Later A description',
          permalink: '/docs/later-a',
          lastReviewed: '2026-08-25',
        },
        {
          title: 'Later B',
          description: 'Later B description',
          permalink: '/docs/later-b',
          lastReviewed: '2026-08-25',
        },
        {
          title: 'Same title',
          description: 'Same title description',
          permalink: '/docs/same-title-a',
          lastReviewed: '2026-08-25',
        },
        {
          title: 'Same title',
          description: 'Same title description',
          permalink: '/docs/same-title-b',
          lastReviewed: '2026-08-25',
        },
        {
          title: 'Earlier',
          description: 'Earlier description',
          permalink: '/archetypes/earlier',
          lastReviewed: '2026-08-20',
        },
        {
          title: 'Duplicate',
          description: 'Duplicate description',
          permalink: '/docs/duplicate',
          lastReviewed: '2026-08-19',
        },
      ],
    });
    expect(empty).toEqual({...authors[1], articles: []});
    expect(grace).toEqual({...authors[2], articles: []});
  });

  it('excludes mirrors, drafts, unlisted docs, and invalid or implicit authorship', () => {
    const result = buildAuthorPageData(
      allContent([
        doc('Mirror', '/agents/human/mirror', '2026-08-25', ['ada'], {
          frontMatter: {
            authors: ['ada'],
            last_reviewed: '2026-08-25',
            content_kind: 'mirror',
          },
        }),
        doc('Draft', '/docs/draft', '2026-08-25', ['ada'], {draft: true}),
        doc('Unlisted', '/docs/unlisted', '2026-08-25', ['ada'], {unlisted: true}),
        doc('Missing date', '/docs/missing-date', '', ['ada'], {
          frontMatter: {authors: ['ada']},
        }),
        doc('Institutional byline only', '/docs/foundation', '2026-08-25', undefined),
        doc('Other author', '/docs/other', '2026-08-25', ['other']),
        doc('String authors', '/docs/string-authors', '2026-08-25', 'ada'),
        doc('Empty authors', '/docs/empty-authors', '2026-08-25', []),
        doc('Numeric date', '/docs/numeric-date', '2026-08-25', ['ada'], {
          frontMatter: {authors: ['ada'], last_reviewed: 20260825},
        }),
      ]),
      authors,
    );

    expect(result[0].articles).toEqual([]);
  });

  it('does not catalog articles whose review date is an empty string', () => {
    expect(
      buildAuthorPageData(
        allContent([doc('Empty date', '/docs/empty-date', '', ['ada'])]),
        authors,
      )[0].articles,
    ).toEqual([]);
  });

  it('normalizes YAML-parsed review dates', () => {
    const metadata = doc('Dated', '/docs/dated', '2026-08-25', ['ada'], {
      frontMatter: {
        authors: ['ada'],
        last_reviewed: new Date('2026-08-25T00:00:00.000Z'),
      },
    });

    expect(buildAuthorPageData(allContent([metadata]), authors)[0].articles).toEqual([
      {
        title: 'Dated',
        description: 'Dated description',
        permalink: '/docs/dated',
        lastReviewed: '2026-08-25',
      },
    ]);
  });

  it('returns no articles when docs plugin content is unavailable', () => {
    expect(buildAuthorPageData({}, authors)).toEqual(
      authors.map((author) => ({...author, articles: []})),
    );
  });

  it('lists co-authored docs on every matching author page', () => {
    const [ada, , grace] = buildAuthorPageData(
      allContent([
        doc('Shared', '/docs/shared', '2026-08-25', ['ada', 123, 'grace']),
        doc('Ada only', '/showcase/ada', '2026-08-24', ['ada']),
      ]),
      authors,
    );

    expect(ada.articles.map((article) => article.permalink)).toEqual([
      '/docs/shared',
      '/showcase/ada',
    ]);
    expect(grace.articles).toEqual([
      {
        title: 'Shared',
        description: 'Shared description',
        permalink: '/docs/shared',
        lastReviewed: '2026-08-25',
      },
    ]);
  });

  it('keeps published foundation, reference, and module docs', () => {
    const result = buildAuthorPageData(
      allContent([
        doc('Foundation', '/docs/foundation', '2026-08-21', ['ada'], {
          frontMatter: {
            authors: ['ada'],
            last_reviewed: '2026-08-21',
            content_kind: 'foundation',
          },
        }),
        doc('Reference', '/docs/reference', '2026-08-22', ['ada'], {
          frontMatter: {
            authors: ['ada'],
            last_reviewed: '2026-08-22',
            content_kind: 'reference',
          },
        }),
        doc('Module', '/docs/module', '2026-08-23', ['ada'], {
          frontMatter: {
            authors: ['ada'],
            last_reviewed: '2026-08-23',
            content_kind: 'module',
          },
        }),
      ]),
      authors,
    );

    expect(result[0].articles.map((article) => article.permalink)).toEqual([
      '/docs/module',
      '/docs/reference',
      '/docs/foundation',
    ]);
  });

  it('sorts same-day, same-title collisions by permalink and keeps the last duplicate', () => {
    const content = allContent([
      doc('Same', '/docs/z-old', '2026-08-25', ['ada']),
    ]);
    content['docusaurus-plugin-content-docs'].standards = {
      loadedVersions: [
        {docs: [doc('Same', '/docs/a-new', '2026-08-25', ['ada'])]},
        {
          docs: [
            doc('Same', '/docs/z-old', '2026-08-26', ['ada'], {
              description: 'Updated duplicate description',
            }),
          ],
        },
      ],
    };

    expect(buildAuthorPageData(content, authors)[0].articles).toEqual([
      {
        title: 'Same',
        description: 'Updated duplicate description',
        permalink: '/docs/z-old',
        lastReviewed: '2026-08-26',
      },
      {
        title: 'Same',
        description: 'Same description',
        permalink: '/docs/a-new',
        lastReviewed: '2026-08-25',
      },
    ]);
  });

  it('ignores malformed docs-plugin payloads and still reads valid islands', () => {
    const content = {
      'docusaurus-plugin-content-docs': {
        default: {loadedVersions: [{docs: [doc('Kept', '/contribute/kept', '2026-08-25', ['ada'])]}]},
        broken: null,
        missingVersions: {docs: []},
        notLoaded: 'skip',
        emptyVersions: {loadedVersions: []},
      },
    } as unknown as AllContent;

    expect(buildAuthorPageData(content, authors)[0].articles).toEqual([
      {
        title: 'Kept',
        description: 'Kept description',
        permalink: '/contribute/kept',
        lastReviewed: '2026-08-25',
      },
    ]);
  });
});
