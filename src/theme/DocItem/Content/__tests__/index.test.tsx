import React from 'react';
import {cleanup, render, screen} from '@testing-library/react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {usePluginData} from '@docusaurus/useGlobalData';
import {authorsById} from '@site/src/data/authors';
import DocItemContent from '../index';

const mockUseDoc = useDoc as jest.Mock;
const mockUsePluginData = usePluginData as jest.Mock;

function renderDoc(
  frontMatter: Record<string, unknown>,
  source: string,
  options: {contentTitle?: string; includeReadTime?: boolean} = {},
) {
  mockUseDoc.mockReturnValue({
    metadata: {
      title: 'Doc Title',
      source,
    },
    frontMatter,
    contentTitle: options.contentTitle,
  });
  mockUsePluginData.mockReturnValue(
    options.includeReadTime === false
      ? undefined
      : {
          readTimes: {
            [source]: 1,
          },
        },
  );

  render(
    <DocItemContent>
      <p>Body</p>
    </DocItemContent>,
  );
}

describe('DocItemContent byline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders foundation pages as institutionally maintained', () => {
    renderDoc(
      {
        content_kind: 'foundation',
      },
      '@site/docs/human/request-for-microproducts.md',
    );

    expect(screen.getByText(/Maintained by/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'Trilemma Foundation'}),
    ).toBeInTheDocument();
    expect(screen.getByText('1 min read')).toBeInTheDocument();
    expect(screen.queryByText(/^By/i)).not.toBeInTheDocument();
  });

  it('renders reference pages as institutionally maintained', () => {
    renderDoc(
      {
        content_kind: 'reference',
        authors: ['trilemma-foundation'],
      },
      '@site/docs/human/authors.mdx',
    );

    expect(screen.getByText(/Maintained by/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'Trilemma Foundation'}),
    ).toBeInTheDocument();
  });

  it('renders foundation pages with personal authors using By', () => {
    renderDoc(
      {
        content_kind: 'foundation',
        authors: ['mohammad-ashkani'],
      },
      '@site/docs/human/playbook/frame/frame.md',
    );

    expect(screen.getByText(/^By/i)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Mohammad Ashkani'})).toBeInTheDocument();
    expect(screen.queryByText(/Maintained by/i)).not.toBeInTheDocument();
  });

  it('renders module pages with normal author bylines', () => {
    renderDoc(
      {
        authors: ['mohammad-ashkani'],
      },
      '@site/docs/human/playbook/frame/frame.md',
    );

    expect(screen.getByText(/^By/i)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Mohammad Ashkani'})).toBeInTheDocument();
    expect(screen.queryByText(/Maintained by/i)).not.toBeInTheDocument();
  });

  it('renders unknown authors as read-time-only metadata', () => {
    renderDoc(
      {authors: [123, 'unknown-author']},
      '@site/docs/human/playbook/unknown.md',
    );

    expect(screen.getByText('1 min read')).toBeInTheDocument();
    expect(screen.queryByText(/^By/i)).not.toBeInTheDocument();
  });

  it('renders authors without profile URLs as plain text', () => {
    authorsById.set('plain-author', {id: 'plain-author', name: 'Plain Author'});
    try {
      renderDoc(
        {authors: ['plain-author']},
        '@site/docs/human/playbook/plain-author.md',
        {includeReadTime: false},
      );
      expect(screen.getByText(/Plain Author/)).toBeInTheDocument();
      expect(screen.queryByRole('link', {name: 'Plain Author'})).not.toBeInTheDocument();
    } finally {
      authorsById.delete('plain-author');
    }
  });

  it('separates multiple authors', () => {
    renderDoc(
      {authors: ['mohammad-ashkani', 'trilemma-foundation']},
      '@site/docs/human/playbook/coauthored.md',
    );
    expect(
      screen.getByRole('link', {name: 'Mohammad Ashkani'}).parentElement,
    ).toHaveTextContent('By Mohammad Ashkani, Trilemma Foundation');
  });

  it('keeps the byline when the markdown title is explicit or hidden', () => {
    renderDoc(
      {authors: ['mohammad-ashkani']},
      '@site/docs/human/explicit.md',
      {contentTitle: 'Explicit title'},
    );
    expect(screen.queryByRole('heading', {name: 'Doc Title'})).not.toBeInTheDocument();
    expect(screen.getByText(/^By/i)).toBeInTheDocument();
    expect(screen.getByText('1 min read')).toBeInTheDocument();

    cleanup();

    renderDoc(
      {authors: ['mohammad-ashkani'], hide_title: true},
      '@site/docs/human/hidden.md',
    );
    expect(screen.queryByRole('heading', {name: 'Doc Title'})).not.toBeInTheDocument();
    expect(screen.getByText(/^By/i)).toBeInTheDocument();
    expect(screen.getByText('1 min read')).toBeInTheDocument();
  });

  it('omits an empty byline and still synthesizes the title when needed', () => {
    renderDoc({}, '@site/docs/human/no-metadata.md', {includeReadTime: false});
    expect(screen.getByRole('heading', {name: 'Doc Title'})).toBeInTheDocument();
    expect(screen.queryByText(/min read/)).not.toBeInTheDocument();
  });
});
