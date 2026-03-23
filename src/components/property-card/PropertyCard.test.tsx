import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ROUTES } from '@/config/routes.ts';
import { PROPERTY_CARD_FALLBACK_IMAGE } from '@/constants/propertyImages.ts';
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '@/hooks/api/useFavoriteApi.ts';
import type { PropertyResponseDto } from '@/types/property.ts';
import { formatMoney } from '@/utils/profileFormatters.ts';
import { isTopPromotionActive } from '@/utils/promotions.ts';
import PropertyCard from './PropertyCard';

vi.mock('@/hooks/api/useFavoriteApi.ts', () => ({
  useAddToFavoritesMutation: vi.fn(),
  useRemoveFromFavoritesMutation: vi.fn(),
}));

vi.mock('@/utils/profileFormatters.ts', () => ({
  formatMoney: vi.fn(),
}));

vi.mock('@/utils/promotions.ts', () => ({
  isTopPromotionActive: vi.fn(),
}));

const mockedUseAddToFavoritesMutation = vi.mocked(useAddToFavoritesMutation);
const mockedUseRemoveFromFavoritesMutation = vi.mocked(useRemoveFromFavoritesMutation);
const mockedFormatMoney = vi.mocked(formatMoney);
const mockedIsTopPromotionActive = vi.mocked(isTopPromotionActive);

const toAddMutationResult = (
  mutateAsync: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue(undefined),
  isPending = false,
): ReturnType<typeof useAddToFavoritesMutation> =>
  ({
    mutate: vi.fn(),
    mutateAsync,
    isPending,
  } as unknown as ReturnType<typeof useAddToFavoritesMutation>);

const toRemoveMutationResult = (
  mutateAsync: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue(undefined),
  isPending = false,
): ReturnType<typeof useRemoveFromFavoritesMutation> =>
  ({
    mutate: vi.fn(),
    mutateAsync,
    isPending,
  } as unknown as ReturnType<typeof useRemoveFromFavoritesMutation>);

const makeProperty = (overrides: Partial<PropertyResponseDto> = {}): PropertyResponseDto => ({
  id: 42,
  hostId: 7,
  address: {
    location: {
      country: 'Ukraine',
      region: 'Kyivska',
      city: 'Kyiv',
    },
    street: 'Khreshchatyk',
    houseNumber: '1',
  },
  title: 'Test property',
  description: 'Nice place',
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
  maxGuests: 3,
  checkInTime: '14:00:00',
  checkOutTime: '11:00:00',
  pricing: {
    pricePerMonth: 15000,
    currency: 'UAH',
  },
  rules: {},
  photos: [
    {
      id: 1,
      url: 'https://example.com/photo.jpg',
      sortOrder: 0,
      createdAt: '2026-03-10T00:00:00Z',
    },
  ],
  amenities: [],
  createdAt: '2026-03-10T00:00:00Z',
  updatedAt: '2026-03-10T00:00:00Z',
  ...overrides,
});

const renderPropertyCard = (property: PropertyResponseDto, isFavorite = false) =>
  render(
    <MemoryRouter>
      <PropertyCard property={property} isFavorite={isFavorite} />
    </MemoryRouter>,
  );

describe('PropertyCard', () => {
  beforeEach(() => {
    mockedFormatMoney.mockReturnValue('formatted-money');
    mockedIsTopPromotionActive.mockReturnValue(false);
    mockedUseAddToFavoritesMutation.mockReturnValue(toAddMutationResult());
    mockedUseRemoveFromFavoritesMutation.mockReturnValue(toRemoveMutationResult());
  });

  it('renders title, image, formatted price and details link', () => {
    const property = makeProperty();
    renderPropertyCard(property);

    expect(screen.getByRole('heading', { name: property.title })).toBeInTheDocument();
    expect(screen.getByText('formatted-money')).toBeInTheDocument();
    expect(screen.getByAltText(property.title)).toHaveAttribute('src', property.photos[0].url);

    const hasDetailsLink = screen
      .getAllByRole('link')
      .some((link) => link.getAttribute('href') === ROUTES.propertyDetails(property.id));
    expect(hasDetailsLink).toBe(true);
  });

  it('calls add to favorites when card is not favorite', async () => {
    const addMutateAsync = vi.fn().mockResolvedValue(undefined);
    const removeMutateAsync = vi.fn().mockResolvedValue(undefined);
    mockedUseAddToFavoritesMutation.mockReturnValue(toAddMutationResult(addMutateAsync));
    mockedUseRemoveFromFavoritesMutation.mockReturnValue(toRemoveMutationResult(removeMutateAsync));

    const property = makeProperty();
    renderPropertyCard(property, false);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button'));

    expect(addMutateAsync).toHaveBeenCalledWith(property.id);
    expect(removeMutateAsync).not.toHaveBeenCalled();
  });

  it('calls remove from favorites when card is already favorite', async () => {
    const addMutateAsync = vi.fn().mockResolvedValue(undefined);
    const removeMutateAsync = vi.fn().mockResolvedValue(undefined);
    mockedUseAddToFavoritesMutation.mockReturnValue(toAddMutationResult(addMutateAsync));
    mockedUseRemoveFromFavoritesMutation.mockReturnValue(toRemoveMutationResult(removeMutateAsync));

    const property = makeProperty();
    renderPropertyCard(property, true);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button'));

    expect(removeMutateAsync).toHaveBeenCalledWith(property.id);
    expect(addMutateAsync).not.toHaveBeenCalled();
  });

  it('uses fallback image when no photos are provided', () => {
    const property = makeProperty({ photos: [] });
    renderPropertyCard(property);

    expect(screen.getByAltText(property.title)).toHaveAttribute('src', PROPERTY_CARD_FALLBACK_IMAGE);
  });
});
