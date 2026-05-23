import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {usePluginData} from '@docusaurus/useGlobalData';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Heading from '@theme/Heading';
import MDXContent from '@theme/MDXContent';
import type {Props} from '@theme/DocItem/Content';
import {authorsById} from '@site/src/data/authors';

import styles from './styles.module.css';

type ReadTimeData = {
  readTimes?: Record<string, number>;
};

type BuildTrilemmaFrontMatter = {
  authors?: unknown;
  content_kind?: unknown;
};

const INSTITUTIONAL_AUTHOR_ID = 'trilemma-foundation';
const institutionalContentKinds = new Set(['foundation', 'reference']);

function useSyntheticTitle(): string | null {
  const {metadata, frontMatter, contentTitle} = useDoc();
  const shouldRender =
    !frontMatter.hide_title && typeof contentTitle === 'undefined';
  if (!shouldRender) {
    return null;
  }
  return metadata.title;
}

function DocByline(): ReactNode {
  const {metadata, frontMatter} = useDoc();
  const readTimeData = usePluginData('doc-read-times') as ReadTimeData | undefined;
  const buildFrontMatter = frontMatter as BuildTrilemmaFrontMatter;
  const contentKind =
    typeof buildFrontMatter.content_kind === 'string'
      ? buildFrontMatter.content_kind
      : 'module';
  const isInstitutional = institutionalContentKinds.has(contentKind);
  const authorIds = Array.isArray(buildFrontMatter.authors)
    ? buildFrontMatter.authors.filter((authorId): authorId is string => typeof authorId === 'string')
    : [];
  const bylineAuthorIds =
    isInstitutional && authorIds.length === 0
      ? [INSTITUTIONAL_AUTHOR_ID]
      : authorIds;
  const pageAuthors = bylineAuthorIds
    .map((authorId) => authorsById.get(authorId))
    .filter(Boolean);
  const readMinutes = readTimeData?.readTimes?.[metadata.source];

  if (pageAuthors.length === 0 && !readMinutes) {
    return null;
  }

  return (
    <p className={styles.docByline}>
      {pageAuthors.length > 0 && (
        <span>
          {isInstitutional ? 'Maintained by ' : 'By '}
          {pageAuthors.map((author, index) => (
            <React.Fragment key={author.id}>
              {index > 0 && ', '}
              {author.url ? (
                <a href={author.url} target="_blank" rel="noopener noreferrer">
                  {author.name}
                </a>
              ) : (
                author.name
              )}
            </React.Fragment>
          ))}
        </span>
      )}
      {pageAuthors.length > 0 && readMinutes && (
        <span className={styles.separator}>·</span>
      )}
      {readMinutes && (
        <span>
          {readMinutes} min read
        </span>
      )}
    </p>
  );
}

export default function DocItemContent({children}: Props): ReactNode {
  const syntheticTitle = useSyntheticTitle();
  return (
    <div className={clsx(ThemeClassNames.docs.docMarkdown, 'markdown')}>
      {syntheticTitle && (
        <header>
          <Heading as="h1">{syntheticTitle}</Heading>
          <DocByline />
        </header>
      )}
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
