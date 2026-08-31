import authorRecords from './authors.json';
import {validatePublicHttpsUrl} from '../utils/publicHttpsUrl';

export type Author = {
  id: string;
  name: string;
  bio?: string;
  url?: string;
};

export function sanitizeAuthorUrl(url: string | undefined): string | undefined {
  if (typeof url !== 'string' || url.length === 0) {
    return undefined;
  }
  return validatePublicHttpsUrl(url) === null ? url : undefined;
}

export function sanitizeAuthor(author: Author): Author {
  const url = sanitizeAuthorUrl(author.url);
  const bio =
    typeof author.bio === 'string' && author.bio.length > 0 ? author.bio : undefined;
  return {
    id: author.id,
    name: author.name,
    ...(bio === undefined ? {} : {bio}),
    ...(url === undefined ? {} : {url}),
  };
}

export const authors: Author[] = authorRecords.map((author) => sanitizeAuthor(author));

export const authorsById = new Map(authors.map((author) => [author.id, author]));
