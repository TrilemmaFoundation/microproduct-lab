import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from '../index';

describe('Hero component', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test Description',
    primaryCta: { label: 'Primary', to: '/primary' },
    secondaryCta: { label: 'Secondary', to: '/secondary' },
  };

  it('renders title and description', () => {
    render(<Hero {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders call-to-action links', () => {
    render(<Hero {...defaultProps} />);
    const primaryLink = screen.getByText('Primary');
    expect(primaryLink).toBeInTheDocument();
    expect(primaryLink.closest('a')).toHaveAttribute('href', '/primary');

    const secondaryLink = screen.getByText('Secondary');
    expect(secondaryLink).toBeInTheDocument();
    expect(secondaryLink.closest('a')).toHaveAttribute('href', '/secondary');
  });
});
