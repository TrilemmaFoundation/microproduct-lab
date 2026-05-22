import React from 'react';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {PlaybookTree, humanPlaybookTree} from '../index';

describe('PlaybookTree', () => {
  const defaultExpandedIds = [
    'human-overview',
    'intro',
    'playbook',
    'frame',
    'build',
  ];

  it('renders the root and level-2 branches', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        defaultExpandedIds={defaultExpandedIds}
        initialSelectedId="human-overview"
      />,
    );

    expect(
      screen.getByRole('button', {name: 'Human Overview'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Intro'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Playbook'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Resources'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Frame'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Build'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Operate'})).toBeInTheDocument();
  });

  it('expands and collapses tree branches', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        defaultExpandedIds={['human-overview', 'playbook']}
        initialSelectedId="human-overview"
      />,
    );

    expect(screen.queryByRole('button', {name: 'Ideation'})).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Expand Frame'}));
    expect(screen.getByRole('button', {name: 'Ideation'})).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Collapse Frame'}));
    expect(screen.queryByRole('button', {name: 'Ideation'})).not.toBeInTheDocument();
  });

  it('updates the context panel when a node is selected', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        defaultExpandedIds={defaultExpandedIds}
        initialSelectedId="human-overview"
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'QA Methodology'}));

    expect(
      screen.getByRole('heading', {name: 'QA Methodology'}),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Use quality gates, behavior-driven checks/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Contributor focus')).toBeInTheDocument();
  });

  it('links selected modules to their docs route', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        defaultExpandedIds={defaultExpandedIds}
        initialSelectedId="frame"
      />,
    );

    const detailPanel = screen.getByRole('complementary');
    expect(within(detailPanel).getByRole('link', {name: 'Open module'})).toHaveAttribute(
      'href',
      '/docs/playbook/frame',
    );

    fireEvent.click(screen.getByRole('button', {name: 'What Is a Microproduct?'}));
    expect(within(detailPanel).getByRole('link', {name: 'Open module'})).toHaveAttribute(
      'href',
      '/docs/intro/what-is-a-microproduct',
    );
  });
});
