import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../index';

describe('Home page', () => {
  it('renders audience gate and primary paths', () => {
    render(<Home />);

    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Turn Data Into Value' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'An open source knowledge hub by Trilemma Foundation for our community of builders.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Humans' })).toHaveAttribute(
      'href',
      '/docs/human-overview',
    );
    expect(screen.getByRole('link', { name: 'Agents' })).toHaveAttribute(
      'href',
      '/agents',
    );
  });
});
