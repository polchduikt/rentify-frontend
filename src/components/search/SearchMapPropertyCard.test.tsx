import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { PropertyResponseDto } from '@/types/property';
import { isTopPromotionActive } from '@/utils/promotions';
import { resolveMapAddressLine, resolveMapPropertyPrice } from '@/utils/searchMap';
import { SearchMapPropertyCard } from './SearchMapPropertyCard';

vi.mock('@/utils/promotions', () => ({
  isTopPromotionActive: vi.fn(),
}));

vi.mock('@/utils/searchMap', () => ({
  resolveMapAddressLine: vi.fn(),
  resolveMapPropertyPrice: vi.fn(),
}));

const mockedIsTopPromotionActive = vi.mocked(isTopPromotionActive);
const mockedResolveMapAddressLine = vi.mocked(resolveMapAddressLine);
const mockedResolveMapPropertyPrice = vi.mocked(resolveMapPropertyPrice);

const makeProperty = (overrides: Partial<PropertyResponseDto> = {}): PropertyResponseDto => ({
  id: 21,
  hostId: 8,
  address: {
    location: {
      country: 'Ukraine',
      region: 'Kyivska',
      city: 'Kyiv',
    },
    street: 'Khreshchatyk',
    houseNumber: '12',
  },
  title: 'Map property',
  description: 'Short description',
  rentalType: 'LONG_TERM',
  status: 'ACTIVE',
  propertyType: 'APARTMENT',
  marketType: 'SECONDARY',
  isVerifiedProperty: true,
  isVerifiedRealtor: false,
  isDuplicate: false,
  isTopPromoted: false,
  viewCount: 0,
  reviewCount: 0,
  averageRating: 0,
  topPromotedUntil: '2026-03-20T00:00:00Z',
  rooms: 2,
  floor: 3,
  totalFloors: 10,
  areaSqm: 50,
  maxGuests: 2,
  checkInTime: '14:00:00',
  checkOutTime: '11:00:00',
  pricing: { pricePerMonth: 15000, currency: 'UAH' },
  rules: { petsAllowed: true },
  photos: [{ id: 1, url: 'https://example.com/photo.jpg', sortOrder: 0, createdAt: '2026-03-10T00:00:00Z' }],
  amenities: [],
  createdAt: '2026-03-10T00:00:00Z',
  updatedAt: '2026-03-10T00:00:00Z',
  ...overrides,
});

describe('SearchMapPropertyCard', () => {
  beforeEach(() => {
    mockedIsTopPromotionActive.mockReturnValue(false);
    mockedResolveMapAddressLine.mockReturnValue('Address line');
    mockedResolveMapPropertyPrice.mockReturnValue({ value: 1234, suffix: '/ month', currency: 'USD' });
  });

  it('renders placeholder when property is null', () => {
    render(
      <MemoryRouter>
        <SearchMapPropertyCard property={null} onClose={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders selected property details and route link', () => {
    const property = makeProperty();
    render(
      <MemoryRouter>
        <SearchMapPropertyCard property={property} onClose={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Address line' })).toBeInTheDocument();
    const priceNode = screen.getByText(/USD/, { selector: 'p' });
    const compactPrice = priceNode.textContent?.replace(/\s+/g, '') ?? '';
    expect(compactPrice).toContain('1234');
    expect(screen.getByRole('link')).toHaveAttribute('href', `/properties/${property.id}`);
  });

  it('calls onClose from both close controls', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <SearchMapPropertyCard property={makeProperty()} onClose={onClose} />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    await user.click(buttons[1]);

    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
