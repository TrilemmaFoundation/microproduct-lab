import { render, screen } from '@testing-library/react';
import { PageSection } from '../index';

describe('ControlSurface', () => {
  it('renders optional content and custom classes', () => {
    render(
      <PageSection eyebrow="Section eyebrow" title="Default section" className="custom">
        <div>Body</div>
      </PageSection>,
    );

    expect(screen.getByText('Section eyebrow')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { name: 'Default section' });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(heading.closest('section')).toHaveClass('custom');
  });
});
