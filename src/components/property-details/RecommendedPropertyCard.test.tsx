import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { FALLBACK_IMAGE } from '@/constants/propertyDetails';
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '@/hooks/api/useFavoriteApi';
import type { PropertyResponseDto } from '@/types/property';
import { isTopPromotionActive } from '@/utils/promotions';
import { formatPropertyPrice } from '@/utils/propertyDetails';
import { RecommendedPropertyCard } from './RecommendedPropertyCard';

vi.mock('@/hooks/api/useFavoriteApi', () => ({
  useAddToFavoritesMutation: vi.fn(),
  useRemoveFromFavoritesMutation: vi.fn(),
}));

vi.mock('@/utils/promotions', () => ({
  isTopPromotionActive: vi.fn(),
}));

vi.mock('@/utils/propertyDetails', async () => {
  const actual = await vi.importActual<typeof import('@/utils/propertyDetails')>('@/utils/propertyDetails');
  return {
    ...actual,
    formatPropertyPrice: vi.fn(),
  };
});

const mockedUseAddToFavoritesMutation = vi.mocked(useAddToFavoritesMutation);
const mockedUseRemoveFromFavoritesMutation = vi.mocked(useRemoveFromFavoritesMutation);
const mockedIsTopPromotionActive = vi.mocked(isTopPromotionActive);
const mockedFormatPropertyPrice = vi.mocked(formatPropertyPrice);

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
  id: 10,
  hostId: 5,
  address: {
    location: {
      country: 'Ukraine',
      region: 'Kyivska',
      city: 'Kyiv',
    },
    street: 'Khreshchatyk',
    houseNumber: '1',
  },
  title: 'Recommended flat',
  description: 'Description',
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
  pricing: {
    pricePerMonth: 17000,
    currency: 'UAH',
  },
  rules: {},
  photos: [{ id: 1, url: 'https://example.com/photo.jpg', sortOrder: 0, createdAt: '2026-03-10T00:00:00Z' }],
  amenities: [],
  createdAt: '2026-03-10T00:00:00Z',
  updatedAt: '2026-03-10T00:00:00Z',
  ...overrides,
});

describe('RecommendedPropertyCard', () => {
  beforeEach(() => {
    mockedFormatPropertyPrice.mockReturnValue('17 000 UAH');
    mockedIsTopPromotionActive.mockReturnValue(false);
    mockedUseAddToFavoritesMutation.mockReturnValue(toAddMutationResult());
    mockedUseRemoveFromFavoritesMutation.mockReturnValue(toRemoveMutationResult());
  });

  it('renders title, price and details link', () => {
    const property = makeProperty();
    render(
      <MemoryRouter>
        <RecommendedPropertyCard property={property} />
      </MemoryRouter>,
    );

    expect(screen.getByText('17 000 UAH')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: property.title })).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', `/properties/${property.id}`);
  });

  it('uses fallback image when property has no photos', () => {
    const property = makeProperty({ photos: [] });
    render(
      <MemoryRouter>
        <RecommendedPropertyCard property={property} />
      </MemoryRouter>,
    );

    expect(screen.getByAltText(property.title)).toHaveAttribute('src', FALLBACK_IMAGE);
  });

  it('calls add favorite mutation when card is not favorite', async () => {
    const addMutateAsync = vi.fn().mockResolvedValue(undefined);
    const removeMutateAsync = vi.fn().mockResolvedValue(undefined);
    mockedUseAddToFavoritesMutation.mockReturnValue(toAddMutationResult(addMutateAsync));
    mockedUseRemoveFromFavoritesMutation.mockReturnValue(toRemoveMutationResult(removeMutateAsync));

    const property = makeProperty();
    render(
      <MemoryRouter>
        <RecommendedPropertyCard property={property} isFavorite={false} />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    expect(addMutateAsync).toHaveBeenCalledWith(property.id);
    expect(removeMutateAsync).not.toHaveBeenCalled();
  });

  it('calls remove favorite mutation when card is favorite', async () => {
    const addMutateAsync = vi.fn().mockResolvedValue(undefined);
    const removeMutateAsync = vi.fn().mockResolvedValue(undefined);
    mockedUseAddToFavoritesMutation.mockReturnValue(toAddMutationResult(addMutateAsync));
    mockedUseRemoveFromFavoritesMutation.mockReturnValue(toRemoveMutationResult(removeMutateAsync));

    const property = makeProperty();
    render(
      <MemoryRouter>
        <RecommendedPropertyCard property={property} isFavorite />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    expect(removeMutateAsync).toHaveBeenCalledWith(property.id);
    expect(addMutateAsync).not.toHaveBeenCalled();
  });
});
