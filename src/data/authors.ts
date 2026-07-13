import authorRecords from './authors.json';

export type Author = {
  id: string;
  name: string;
  url?: string;
};

export const authors: Author[] = authorRecords;

export const authorsById = new Map(authors.map((author) => [author.id, author]));
