import type {AllContent} from '@docusaurus/types';
import type {DocMetadata, LoadedContent} from '@docusaurus/plugin-content-docs';
import type {Author} from './authors';

export type AuthorArticle = {
  title: string;
  description: string;
  permalink: string;
  lastReviewed: string;
};

export type AuthorPageData = Pick<Author, 'id' | 'name' | 'bio' | 'url'> & {
  articles: AuthorArticle[];
};

function isLoadedContent(value: unknown): value is LoadedContent {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as Partial<LoadedContent>).loadedVersions)
  );
}

function authoredArticle(
  doc: DocMetadata,
  authorId: string,
): AuthorArticle | undefined {
  const authorIds = doc.frontMatter.authors;
  const reviewedDate = doc.frontMatter.last_reviewed;
  const lastReviewed =
    typeof reviewedDate === 'string' && reviewedDate.length > 0
      ? reviewedDate
      : reviewedDate instanceof Date
        ? reviewedDate.toISOString().slice(0, 10)
        : undefined;
  if (
    doc.draft ||
    doc.unlisted ||
    doc.frontMatter.content_kind === 'mirror' ||
    !Array.isArray(authorIds) ||
    !authorIds.includes(authorId) ||
    lastReviewed === undefined
  ) {
    return undefined;
  }

  return {
    title: doc.title,
    description: doc.description,
    permalink: doc.permalink,
    lastReviewed,
  };
}

function sortArticles(left: AuthorArticle, right: AuthorArticle): number {
  return (
    right.lastReviewed.localeCompare(left.lastReviewed) ||
    left.title.localeCompare(right.title) ||
    left.permalink.localeCompare(right.permalink)
  );
}

function docsFromAllContent(allContent: AllContent): DocMetadata[] {
  const docsPlugins = allContent['docusaurus-plugin-content-docs'];
  if (!docsPlugins) {
    return [];
  }

  return Object.values(docsPlugins)
    .filter(isLoadedContent)
    .flatMap((content) => content.loadedVersions.flatMap((version) => version.docs));
}

export function buildAuthorPageData(
  allContent: AllContent,
  authors: readonly Author[],
): AuthorPageData[] {
  const docs = docsFromAllContent(allContent);

  return authors.map((author) => {
    const articlesByPermalink = new Map<string, AuthorArticle>();
    for (const doc of docs) {
      const article = authoredArticle(doc, author.id);
      if (article) {
        articlesByPermalink.set(article.permalink, article);
      }
    }

    return {
      id: author.id,
      name: author.name,
      ...(author.bio === undefined ? {} : {bio: author.bio}),
      ...(author.url === undefined ? {} : {url: author.url}),
      articles: [...articlesByPermalink.values()].sort(sortArticles),
    };
  });
}
