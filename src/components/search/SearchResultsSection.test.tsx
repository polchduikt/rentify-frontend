import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PropertyMapPinDto, PropertyResponseDto } from '@/types/property';
import type { SearchMapBounds, SearchPaginationItem, SearchViewMode } from '@/types/search';
import { SearchResultsSection } from './SearchResultsSection';

vi.mock('@/components/search/PropertyListItem', () => ({
  PropertyListItem: ({ property }: { property: PropertyResponseDto }) => (
    <div data-testid="property-list-item">{property.id}</div>
  ),
}));

vi.mock('@/components/search/SearchResultsMap', () => ({
  SearchResultsMap: ({ onSelectProperty }: { onSelectProperty: (propertyId: number) => void }) => (
    <button type="button" data-testid="search-results-map-mock" onClick={() => onSelectProperty(999)}>
      map
    </button>
  ),
}));

const makeProperty = (id: number): PropertyResponseDto => ({
  id,
  hostId: id + 100,
  address: {
    location: {
      country: 'Ukraine',
      region: 'Kyivska',
      city: 'Kyiv',
    },
    street: 'Test',
    houseNumber: String(id),
  },
  title: `Property ${id}`,
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
  pricing: { pricePerMonth: 10000, currency: 'UAH' },
  rules: {},
  photos: [],
  amenities: [],
  createdAt: '2026-03-10T00:00:00Z',
  updatedAt: '2026-03-10T00:00:00Z',
});

interface SearchResultsOverrides {
  viewMode?: SearchViewMode;
  loading?: boolean;
  filtered?: PropertyResponseDto[];
  visibleItems?: PropertyResponseDto[];
  visibleCount?: number;
  paginationItems?: SearchPaginationItem[];
}

const renderSearchResultsSection = (overrides: SearchResultsOverrides = {}) => {
  const properties = overrides.filtered ?? [makeProperty(1), makeProperty(2)];
  const visibleItems = overrides.visibleItems ?? properties;
  const mapPins: PropertyMapPinDto[] = [];
  const onViewModeChange = vi.fn();
  const onOpenMapPage = vi.fn();
  const onMapPropertySelect = vi.fn();
  const onMapBoundsChange = vi.fn<(bounds: SearchMapBounds) => void>();
  const onShowMore = vi.fn();
  const onPrevPage = vi.fn();
  const onNextPage = vi.fn();
  const onPageChange = vi.fn();

  render(
    <SearchResultsSection
      loading={overrides.loading ?? false}
      error={null}
      filtered={properties}
      visibleItems={visibleItems}
      viewMode={overrides.viewMode ?? 'single'}
      mapPinsLoading={false}
      mapPinsError={null}
      mapPins={mapPins}
      selectedMapPropertyId={undefined}
      selectedMapProperty={null}
      currentPage={1}
      totalPages={3}
      visibleCount={overrides.visibleCount ?? visibleItems.length}
      paginationItems={overrides.paginationItems ?? [1, 2, 'dots-right', 5]}
      favoriteIds={new Set<number>()}
      onViewModeChange={onViewModeChange}
      onOpenMapPage={onOpenMapPage}
      onMapPropertySelect={onMapPropertySelect}
      onMapBoundsChange={onMapBoundsChange}
      onShowMore={onShowMore}
      onPrevPage={onPrevPage}
      onNextPage={onNextPage}
      onPageChange={onPageChange}
    />,
  );

  return {
    onViewModeChange,
    onOpenMapPage,
    onMapPropertySelect,
    onMapBoundsChange,
    onShowMore,
    onPrevPage,
    onNextPage,
    onPageChange,
  };
};

describe('SearchResultsSection', () => {
  it('renders property list items in list view', () => {
    renderSearchResultsSection({ viewMode: 'single' });
    expect(screen.getAllByTestId('property-list-item')).toHaveLength(2);
  });

  it('switches to map page when map toggle is clicked in list view', async () => {
    const user = userEvent.setup();
    const { onOpenMapPage } = renderSearchResultsSection({ viewMode: 'single' });

    const topButtons = screen.getAllByRole('button').slice(0, 3);
    await user.click(topButtons[2]);

    expect(onOpenMapPage).toHaveBeenCalledTimes(1);
  });

  it('renders map mock in map view and toggles back to list', async () => {
    const user = userEvent.setup();
    const { onMapPropertySelect, onViewModeChange } = renderSearchResultsSection({ viewMode: 'map' });

    const mapMock = await screen.findByTestId('search-results-map-mock');
    await user.click(mapMock);
    expect(onMapPropertySelect).toHaveBeenCalledWith(999);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    expect(onViewModeChange).toHaveBeenCalledWith('single');
  });

  it('calls show more when incremental loading button is clicked', async () => {
    const user = userEvent.setup();
    const { onShowMore } = renderSearchResultsSection({
      viewMode: 'single',
      filtered: Array.from({ length: 30 }, (_, index) => makeProperty(index + 1)),
      visibleItems: Array.from({ length: 10 }, (_, index) => makeProperty(index + 1)),
      visibleCount: 10,
      paginationItems: [1, 2, 3],
    });

    const showMoreButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('20'));

    expect(showMoreButton).toBeDefined();
    if (!showMoreButton) {
      throw new Error('Show more button not found');
    }

    await user.click(showMoreButton);
    expect(onShowMore).toHaveBeenCalledTimes(1);
  });
});
