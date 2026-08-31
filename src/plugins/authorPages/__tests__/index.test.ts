import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type {AllContent, LoadContext} from '@docusaurus/types';
import authorPagesPlugin from '../index';

function writeSite(authors: unknown): string {
  const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'author-pages-plugin-'));
  fs.mkdirSync(path.join(siteDir, 'src', 'data'), {recursive: true});
  fs.writeFileSync(
    path.join(siteDir, 'src', 'data', 'authors.json'),
    typeof authors === 'string' ? authors : JSON.stringify(authors),
    'utf8',
  );
  return siteDir;
}

function addRoutes(siteDir: string, allContent: AllContent = {}) {
  const plugin = authorPagesPlugin({siteDir} as LoadContext);
  const addRoute = jest.fn();
  plugin.allContentLoaded?.({
    allContent,
    actions: {addRoute},
  } as never);
  return addRoute;
}

describe('authorPagesPlugin', () => {
  const siteDirs: string[] = [];

  afterEach(() => {
    for (const siteDir of siteDirs.splice(0)) {
      fs.rmSync(siteDir, {recursive: true, force: true});
    }
  });

  it('registers exact native routes and sanitizes registry bios and URLs', () => {
    const siteDir = writeSite([
      {
        id: 'safe',
        name: 'Safe Author',
        bio: 'Writes tests.',
        url: 'https://example.com/safe',
      },
      {id: 'blank-bio', name: 'Blank Bio', bio: '', url: 'javascript:alert(1)'},
      {id: 'http-only', name: 'HTTP Only', url: 'http://example.com'},
    ]);
    siteDirs.push(siteDir);

    const addRoute = addRoutes(siteDir, {
      'docusaurus-plugin-content-docs': {
        default: {
          loadedVersions: [
            {
              docs: [
                {
                  title: 'Safe Doc',
                  description: 'A published article.',
                  permalink: '/docs/safe-doc',
                  draft: false,
                  unlisted: false,
                  frontMatter: {authors: ['safe'], last_reviewed: '2026-08-25'},
                },
              ],
            },
          ],
        },
      },
    } as AllContent);

    expect(addRoute).toHaveBeenCalledTimes(3);
    expect(addRoute.mock.calls.map((call) => call[0].path)).toEqual([
      '/authors/safe',
      '/authors/blank-bio',
      '/authors/http-only',
    ]);
    expect(addRoute.mock.calls[0][0]).toMatchObject({
      component: '@site/src/components/AuthorPage',
      exact: true,
      props: {
        author: {
          id: 'safe',
          name: 'Safe Author',
          bio: 'Writes tests.',
          url: 'https://example.com/safe',
          articles: [
            {
              title: 'Safe Doc',
              description: 'A published article.',
              permalink: '/docs/safe-doc',
              lastReviewed: '2026-08-25',
            },
          ],
        },
      },
    });
    expect(addRoute.mock.calls[1][0].props.author).toEqual({
      id: 'blank-bio',
      name: 'Blank Bio',
      articles: [],
    });
    expect(addRoute.mock.calls[2][0].props.author).toEqual({
      id: 'http-only',
      name: 'HTTP Only',
      articles: [],
    });
  });

  it('fails closed when the author registry is missing or invalid', () => {
    const missing = fs.mkdtempSync(path.join(os.tmpdir(), 'author-pages-missing-'));
    siteDirs.push(missing);
    expect(() => addRoutes(missing)).toThrow();

    const invalid = writeSite('not json');
    siteDirs.push(invalid);
    expect(() => addRoutes(invalid)).toThrow();
  });
});
