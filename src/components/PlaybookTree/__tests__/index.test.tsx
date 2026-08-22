import React from 'react';
import {fireEvent, render, screen, within} from '@testing-library/react';
import {PlaybookTree, humanPlaybookTree} from '../index';

describe('PlaybookTree', () => {
  const fullyExpandedIds = [
    'human-overview',
    'intro',
    'playbook',
    'frame-section',
    'build-section',
  ];

  it('renders only the root and its direct branches by default', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        initialSelectedId="human-overview"
      />,
    );

    expect(
      screen.getByRole('button', {name: 'Human Overview'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Playbook'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Request For Microproducts'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Authors'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Intro'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Plan'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Build'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Operate'})).not.toBeInTheDocument();
    expect(screen.queryByText(/Level \d/)).not.toBeInTheDocument();

    const tree = screen.getByRole('list', {name: 'Human playbook tree'});
    const visibleNodeLabels = within(tree)
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-pressed') !== null)
      .map((button) => button.textContent);

    expect(visibleNodeLabels).toEqual([
      'Human Overview',
      'Playbook',
      'Request For Microproducts',
      'Authors',
    ]);
  });

  it('expands and collapses tree branches', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        defaultExpandedIds={['human-overview', 'playbook']}
        initialSelectedId="human-overview"
      />,
    );

    expect(screen.queryByRole('button', {name: 'Frame'})).not.toBeInTheDocument();

    const tree = screen.getByRole('list', {name: 'Human playbook tree'});
    const visibleNodeLabels = within(tree)
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-pressed') !== null)
      .map((button) => button.textContent);

    expect(visibleNodeLabels).toEqual([
      'Human Overview',
      'Playbook',
      'Plan',
      'Build',
      'Operate',
      'Request For Microproducts',
      'Authors',
    ]);

    fireEvent.click(screen.getByRole('button', {name: 'Expand Plan'}));
    expect(screen.getByRole('button', {name: 'Frame'})).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Collapse Plan'}));
    expect(screen.queryByRole('button', {name: 'Frame'})).not.toBeInTheDocument();
  });

  it('treats folder-like sections as non-module containers', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        defaultExpandedIds={['human-overview', 'playbook']}
        initialSelectedId="human-overview"
      />,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Plan'}));

    const detailPanel = screen.getByRole('complementary');
    expect(
      within(detailPanel).getByRole('heading', {name: 'Plan'}),
    ).toBeInTheDocument();
    expect(
      within(detailPanel).queryByRole('link', {name: 'Open module'}),
    ).not.toBeInTheDocument();
  });

  it('updates the context panel when a node is selected', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        defaultExpandedIds={fullyExpandedIds}
        initialSelectedId="human-overview"
      />,
    );

    fireEvent.click(screen.getAllByRole('button', {name: 'Build'}).at(-1)!);

    expect(
      screen.getByRole('heading', {name: 'Build'}),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Execute, validate quality, and deliver/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('Contributor focus')).not.toBeInTheDocument();
  });

  it('shows the current-page state for the human overview root', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        initialSelectedId="human-overview"
      />,
    );

    const detailPanel = screen.getByRole('complementary');
    expect(within(detailPanel).getByRole('button', {name: 'You are here'})).toBeDisabled();
    expect(
      within(detailPanel).queryByRole('link', {name: 'Open module'}),
    ).not.toBeInTheDocument();
  });

  it('links selected modules to their docs route', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        defaultExpandedIds={fullyExpandedIds}
        initialSelectedId="frame"
      />,
    );

    const detailPanel = screen.getByRole('complementary');
    expect(within(detailPanel).getByRole('link', {name: 'Open module'})).toHaveAttribute(
      'href',
      '/docs/playbook/frame',
    );

    fireEvent.click(screen.getAllByRole('button', {name: 'Build'}).at(-1)!);
    expect(within(detailPanel).getByRole('link', {name: 'Open module'})).toHaveAttribute(
      'href',
      '/docs/playbook/build',
    );
  });

  it('falls back to the root node when the initial selection is unknown', () => {
    render(
      <PlaybookTree
        nodes={humanPlaybookTree}
        initialSelectedId="does-not-exist"
      />,
    );

    const detailPanel = screen.getByRole('complementary');
    expect(
      within(detailPanel).getByRole('heading', {name: 'Human Overview'}),
    ).toBeInTheDocument();
  });
});
