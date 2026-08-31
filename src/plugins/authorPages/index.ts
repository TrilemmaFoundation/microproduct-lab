import fs from 'node:fs';
import path from 'node:path';
import type {LoadContext, Plugin} from '@docusaurus/types';
import {buildAuthorPageData} from '../../data/authorPages';
import {validatePublicHttpsUrl} from '../../utils/publicHttpsUrl';

type AuthorRecord = {
  id: string;
  name: string;
  bio?: string;
  url?: string;
};

const authorIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isAuthorRecord(value: unknown): value is AuthorRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Partial<AuthorRecord>).id === 'string' &&
    authorIdPattern.test((value as AuthorRecord).id) &&
    typeof (value as Partial<AuthorRecord>).name === 'string' &&
    (value as AuthorRecord).name.trim().length > 0
  );
}

function loadAuthors(siteDir: string): AuthorRecord[] {
  const authorsPath = path.join(siteDir, 'src', 'data', 'authors.json');
  const authorRecords: unknown = JSON.parse(fs.readFileSync(authorsPath, 'utf8'));
  if (!Array.isArray(authorRecords) || !authorRecords.every(isAuthorRecord)) {
    throw new TypeError('Author registry must contain route-safe author records.');
  }
  return authorRecords.map((author) => ({
    id: author.id,
    name: author.name,
    ...(typeof author.bio === 'string' && author.bio.length > 0 ? {bio: author.bio} : {}),
    ...(typeof author.url === 'string' && validatePublicHttpsUrl(author.url) === null
      ? {url: author.url}
      : {}),
  }));
}

export default function authorPagesPlugin(context: LoadContext): Plugin {
  return {
    name: 'author-pages',
    allContentLoaded({allContent, actions}) {
      for (const author of buildAuthorPageData(allContent, loadAuthors(context.siteDir))) {
        actions.addRoute({
          path: `/authors/${author.id}`,
          component: '@site/src/components/AuthorPage',
          exact: true,
          props: {author},
        });
      }
    },
  };
}
