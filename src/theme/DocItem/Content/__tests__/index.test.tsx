import React from 'react';
import {render, screen} from '@testing-library/react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {usePluginData} from '@docusaurus/useGlobalData';
import DocItemContent from '../index';

const mockUseDoc = useDoc as jest.Mock;
const mockUsePluginData = usePluginData as jest.Mock;

function renderDoc(frontMatter: Record<string, unknown>, source: string) {
  mockUseDoc.mockReturnValue({
    metadata: {
      title: 'Doc Title',
      source,
    },
    frontMatter,
    contentTitle: undefined,
  });
  mockUsePluginData.mockReturnValue({
    readTimes: {
      [source]: 1,
    },
  });

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

  it('renders foundation pages as institutionally maintained', () => {
    renderDoc(
      {
        content_kind: 'foundation',
      },
      '@site/docs/human/human-overview.mdx',
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
      '@site/docs/human/authors/index.mdx',
    );

    expect(screen.getByText(/Maintained by/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'Trilemma Foundation'}),
    ).toBeInTheDocument();
  });

  it('renders module pages with normal author bylines', () => {
    renderDoc(
      {
        authors: ['mohammad-ashkani'],
      },
      '@site/docs/human/playbook/intro/what-is-a-microproduct.mdx',
    );

    expect(screen.getByText(/^By/i)).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Mohammad Ashkani'})).toBeInTheDocument();
    expect(screen.queryByText(/Maintained by/i)).not.toBeInTheDocument();
  });
});
