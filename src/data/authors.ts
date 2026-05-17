export type Author = {
  id: string;
  name: string;
  url?: string;
};

export const authors: Author[] = [
  {
    id: 'trilemma-foundation',
    name: 'Trilemma Foundation',
    url: 'https://www.trilemma.foundation/',
  },
];

export const authorsById = new Map(authors.map((author) => [author.id, author]));
