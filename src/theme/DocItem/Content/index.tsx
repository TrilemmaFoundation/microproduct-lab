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
  const authorIds = Array.isArray(frontMatter.authors)
    ? frontMatter.authors.filter((authorId): authorId is string => typeof authorId === 'string')
    : [];
  const pageAuthors = authorIds
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
          By{' '}
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
