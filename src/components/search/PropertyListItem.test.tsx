import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SEARCH_PROPERTY_FALLBACK_IMAGE } from '@/constants/propertyImages';
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '@/hooks/api/useFavoriteApi';
import type { PropertyResponseDto } from '@/types/property';
import { isTopPromotionActive } from '@/utils/promotions';
import { PropertyListItem } from './PropertyListItem';

vi.mock('@/hooks/api/useFavoriteApi', () => ({
  useAddToFavoritesMutation: vi.fn(),
  useRemoveFromFavoritesMutation: vi.fn(),
}));

vi.mock('@/utils/promotions', () => ({
  isTopPromotionActive: vi.fn(),
}));

const mockedUseAddToFavoritesMutation = vi.mocked(useAddToFavoritesMutation);
const mockedUseRemoveFromFavoritesMutation = vi.mocked(useRemoveFromFavoritesMutation);
const mockedIsTopPromotionActive = vi.mocked(isTopPromotionActive);

const toAddMutationResult = (
  mutateAsync: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue(undefined),
  isPending = false,
): ReturnType<typeof useAddToFavoritesMutation> =>
  ({
    mutate: vi.fn(),
    mutateAsync,
    isPending,
  }) as unknown as ReturnType<typeof useAddToFavoritesMutation>;

const toRemoveMutationResult = (
  mutateAsync: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue(undefined),
  isPending = false,
): ReturnType<typeof useRemoveFromFavoritesMutation> =>
  ({
    mutate: vi.fn(),
    mutateAsync,
    isPending,
  }) as unknown as ReturnType<typeof useRemoveFromFavoritesMutation>;

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
  title: 'Modern flat',
  description: 'A very good property',
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
  photos: [{ id: 1, url: 'https://example.com/photo-1.jpg', sortOrder: 0, createdAt: '2026-03-10T00:00:00Z' }],
  amenities: [],
  createdAt: '2026-03-10T00:00:00Z',
  updatedAt: '2026-03-10T00:00:00Z',
  ...overrides,
});

describe('PropertyListItem', () => {
  beforeEach(() => {
    mockedIsTopPromotionActive.mockReturnValue(false);
    mockedUseAddToFavoritesMutation.mockReturnValue(toAddMutationResult());
    mockedUseRemoveFromFavoritesMutation.mockReturnValue(toRemoveMutationResult());
  });

  it('uses fallback image when property has no photos', () => {
    const property = makeProperty({ photos: [] });
    render(
      <MemoryRouter>
        <PropertyListItem property={property} />
      </MemoryRouter>,
    );

    expect(screen.getByAltText(property.title)).toHaveAttribute('src', SEARCH_PROPERTY_FALLBACK_IMAGE);
  });

  it('navigates gallery photos with next/prev controls', async () => {
    const user = userEvent.setup();
    const property = makeProperty({
      photos: [
        { id: 1, url: 'https://example.com/photo-1.jpg', sortOrder: 0, createdAt: '2026-03-10T00:00:00Z' },
        { id: 2, url: 'https://example.com/photo-2.jpg', sortOrder: 1, createdAt: '2026-03-10T00:00:00Z' },
      ],
    });

    render(
      <MemoryRouter>
        <PropertyListItem property={property} />
      </MemoryRouter>,
    );

    const image = screen.getByAltText(property.title);
    expect(image).toHaveAttribute('src', property.photos[0].url);

    await user.click(screen.getByRole('button', { name: /Next photo/i }));
    expect(image).toHaveAttribute('src', property.photos[1].url);

    await user.click(screen.getByRole('button', { name: /Previous photo/i }));
    expect(image).toHaveAttribute('src', property.photos[0].url);
  });

  it('calls add to favorites when item is not favorite', async () => {
    const user = userEvent.setup();
    const addMutateAsync = vi.fn().mockResolvedValue(undefined);
    const removeMutateAsync = vi.fn().mockResolvedValue(undefined);
    mockedUseAddToFavoritesMutation.mockReturnValue(toAddMutationResult(addMutateAsync));
    mockedUseRemoveFromFavoritesMutation.mockReturnValue(toRemoveMutationResult(removeMutateAsync));

    const property = makeProperty();
    render(
      <MemoryRouter>
        <PropertyListItem property={property} isFavorite={false} />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByRole('button');
    const favoriteButton = buttons[buttons.length - 1];
    if (!favoriteButton) {
      throw new Error('Favorite button not found');
    }

    await user.click(favoriteButton);
    expect(addMutateAsync).toHaveBeenCalledWith(property.id);
    expect(removeMutateAsync).not.toHaveBeenCalled();
  });

  it('calls remove from favorites when item is favorite', async () => {
    const user = userEvent.setup();
    const addMutateAsync = vi.fn().mockResolvedValue(undefined);
    const removeMutateAsync = vi.fn().mockResolvedValue(undefined);
    mockedUseAddToFavoritesMutation.mockReturnValue(toAddMutationResult(addMutateAsync));
    mockedUseRemoveFromFavoritesMutation.mockReturnValue(toRemoveMutationResult(removeMutateAsync));

    const property = makeProperty();
    render(
      <MemoryRouter>
        <PropertyListItem property={property} isFavorite />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByRole('button');
    const favoriteButton = buttons[buttons.length - 1];
    if (!favoriteButton) {
      throw new Error('Favorite button not found');
    }

    await user.click(favoriteButton);
    expect(removeMutateAsync).toHaveBeenCalledWith(property.id);
    expect(addMutateAsync).not.toHaveBeenCalled();
  });
});
