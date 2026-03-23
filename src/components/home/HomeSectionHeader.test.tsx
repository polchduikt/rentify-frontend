import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomeSectionHeader from './HomeSectionHeader';

describe('HomeSectionHeader', () => {
  it('renders title, subtitle and section link', () => {
    render(
      <MemoryRouter>
        <HomeSectionHeader
          title="Popular listings"
          subtitle="Hand-picked options"
          linkTo="/search"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Popular listings' })).toBeInTheDocument();
    expect(screen.getByText('Hand-picked options')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/search');
  });
});
