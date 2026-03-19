import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import PopularCitiesGrid from './PopularCitiesGrid';

describe('PopularCitiesGrid', () => {
  it('renders city cards with formatted listing counters and encoded links', () => {
    const cities = [
      {
        name: 'Kyiv',
        query: 'Kyiv Center',
        image: 'https://example.com/kyiv.jpg',
        listingsCount: 1200,
      },
      {
        name: 'Lviv',
        query: 'Lviv',
        image: 'https://example.com/lviv.jpg',
        listingsCount: 999,
      },
    ];

    render(
      <MemoryRouter>
        <PopularCitiesGrid cities={cities} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/1\.2k\+/)).toBeInTheDocument();
    expect(screen.getByText(/999\+/)).toBeInTheDocument();
    expect(screen.getByAltText(/Kyiv/)).toHaveAttribute('src', 'https://example.com/kyiv.jpg');
    expect(screen.getByAltText(/Lviv/)).toHaveAttribute('src', 'https://example.com/lviv.jpg');

    const allLinks = screen.getAllByRole('link');
    const hasKyivLink = allLinks.some(
      (link) => link.getAttribute('href') === `${ROUTES.search}?city=${encodeURIComponent('Kyiv Center')}`,
    );
    const hasLvivLink = allLinks.some(
      (link) => link.getAttribute('href') === `${ROUTES.search}?city=${encodeURIComponent('Lviv')}`,
    );

    expect(hasKyivLink).toBe(true);
    expect(hasLvivLink).toBe(true);
  });
});
