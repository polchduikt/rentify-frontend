import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useAmenitiesGroupedQuery,
  useLocationSuggestQuery,
  useMyFavoritesQuery,
  usePropertyByIdQuery,
  useSearchPropertiesQuery,
  useSearchPropertyMapPinsQuery,
} from '@/hooks/api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuth } from '@/contexts/AuthContext';
import type { AmenityCategory } from '@/types/enums';
import type { LocationSuggestionDto } from '@/types/location';
import type { SearchExtraFilters, SearchMapBounds, SearchSortMode, SearchViewMode } from '@/types/search';
import { getApiErrorMessage } from '@/utils/errors';
import { buildFallbackMapPins, enrichMapPinsWithRooms } from '@/utils/search/mapPins';
import {
  applyClientOnlyFilters,
  buildPagination,
  buildSearchParams,
  countExtraFilters,
  createFiltersFromSearchParams,
  EMPTY_FORM_FILTERS,
  PAGE_SIZE,
  parsePositiveInt,
  parseRentalType,
  parseSortMode,
  parseViewMode,
  sortProperties,
  toCriteria,
} from '@/utils/search/searchPageUtils';

const MAP_PINS_PAGE_SIZE = 300;
const SCROLL_TOP = 0;

const createEmptyFormState = () => ({
  ...EMPTY_FORM_FILTERS,
  extra: {
    ...EMPTY_FORM_FILTERS.extra,
    amenitySlugs: [],
    amenityCategories: [],
  },
});

const areBoundsEqual = (left: SearchMapBounds | null, right: SearchMapBounds): boolean =>
  !!left &&
  Math.abs(left.southWestLat - right.southWestLat) < 0.000001 &&
  Math.abs(left.southWestLng - right.southWestLng) < 0.000001 &&
  Math.abs(left.northEastLat - right.northEastLat) < 0.000001 &&
  Math.abs(left.northEastLng - right.northEastLng) < 0.000001;

export const useSearchPage = () => {
  const { isAuthenticated } = useAuth();
  const [params, setParams] = useSearchParams();

  const [draftFilters, setDraftFilters] = useState(() => createFiltersFromSearchParams(params));
  const [urlFilters, setUrlFilters] = useState(() => createFiltersFromSearchParams(params));
  const [draftSortMode, setDraftSortMode] = useState<SearchSortMode>(() => parseSortMode(params.get('sortMode')));
  const [urlSortMode, setUrlSortMode] = useState<SearchSortMode>(() => parseSortMode(params.get('sortMode')));
  const [viewMode, setViewMode] = useState<SearchViewMode>(() => parseViewMode(params.get('view')));
  const [currentPageState, setCurrentPageState] = useState(() => parsePositiveInt(params.get('page')));
  const [loadedPagesFromCurrent, setLoadedPagesFromCurrent] = useState(1);
  const [mapBounds, setMapBounds] = useState<SearchMapBounds | null>(null);
  const [selectedMapPropertyId, setSelectedMapPropertyId] = useState<number | undefined>(undefined);

  const deferredDraftFilters = useDeferredValue(draftFilters);
  const deferredSortMode = useDeferredValue(draftSortMode);
  const deferredMapBounds = useDeferredValue(mapBounds);
  const debouncedFilters = useDebouncedValue(deferredDraftFilters, 260);
  const debouncedCityInput = useDebouncedValue(deferredDraftFilters.cityInput, 260);
  const debouncedMapBounds = useDebouncedValue(deferredMapBounds, 220);

  useEffect(() => {
    const next = buildSearchParams(urlFilters, urlSortMode, viewMode, currentPageState);
    if (params.toString() !== next.toString()) {
      setParams(next, { replace: true });
    }
  }, [currentPageState, params, setParams, urlFilters, urlSortMode, viewMode]);

  const criteria = useMemo(() => toCriteria(debouncedFilters), [debouncedFilters]);
  const mapCriteria = useMemo(
    () => ({
      ...criteria,
      ...(debouncedMapBounds ?? {}),
    }),
    [criteria, debouncedMapBounds]
  );

  const propertiesQuery = useSearchPropertiesQuery(criteria, { page: 0, size: 200, sort: 'createdAt,desc' });
  const mapPinsQuery = useSearchPropertyMapPinsQuery(
    mapCriteria,
    { page: 0, size: MAP_PINS_PAGE_SIZE, sort: 'createdAt,desc' },
    viewMode === 'map'
  );
  const locationSuggestQuery = useLocationSuggestQuery(
    { q: debouncedCityInput, limit: 10 },
    debouncedCityInput.trim().length >= 2
  );
  const amenitiesGroupedQuery = useAmenitiesGroupedQuery();
  const favoritesQuery = useMyFavoritesQuery(isAuthenticated);

  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data?.map((favorite) => favorite.propertyId) ?? []),
    [favoritesQuery.data]
  );

  const filtered = useMemo(() => {
    const source = propertiesQuery.data?.content ?? [];
    const activeOnly = source.filter((property) => String(property.status).toUpperCase() === 'ACTIVE');
    const withClientRules = applyClientOnlyFilters(activeOnly, deferredDraftFilters);
    return sortProperties(withClientRules, deferredSortMode);
  }, [deferredDraftFilters, deferredSortMode, propertiesQuery.data?.content]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(currentPageState, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const maxVisibleFromCurrent = Math.max(0, filtered.length - startIndex);
  const currentPageMaxSegments = Math.max(1, Math.ceil(maxVisibleFromCurrent / PAGE_SIZE));
  const currentVisibleCount = Math.min(maxVisibleFromCurrent, loadedPagesFromCurrent * PAGE_SIZE);
  const visibleItems = filtered.slice(startIndex, startIndex + currentVisibleCount);
  const visibleCount = startIndex + visibleItems.length;
  const remainingCount = Math.max(0, filtered.length - visibleCount);
  const hasMoreFromCurrentPage = remainingCount > 0;
  const paginationItems = buildPagination(currentPage, totalPages);

  useEffect(() => {
    if (propertiesQuery.isLoading || propertiesQuery.isFetching) {
      return;
    }
    if (currentPageState <= totalPages) {
      return;
    }
    setCurrentPageState(totalPages);
    setLoadedPagesFromCurrent(1);
  }, [currentPageState, propertiesQuery.isFetching, propertiesQuery.isLoading, totalPages]);

  const fallbackMapPins = useMemo(() => buildFallbackMapPins(filtered), [filtered]);
  const mapPins = useMemo(() => {
    const serverPins = mapPinsQuery.data?.content ?? [];
    const allowedIds = new Set(filtered.map((property) => property.id));
    return enrichMapPinsWithRooms(serverPins.length > 0 ? serverPins : fallbackMapPins, filtered).filter((pin) =>
      allowedIds.has(pin.id),
    );
  }, [fallbackMapPins, filtered, mapPinsQuery.data?.content]);

  const selectedPropertyFromFiltered = useMemo(
    () => (selectedMapPropertyId != null ? filtered.find((property) => property.id === selectedMapPropertyId) ?? null : null),
    [filtered, selectedMapPropertyId]
  );
  const selectedPropertyQuery = usePropertyByIdQuery(
    selectedMapPropertyId ?? 0,
    selectedMapPropertyId != null && selectedPropertyFromFiltered == null
  );
  const selectedMapProperty = selectedPropertyFromFiltered ?? selectedPropertyQuery.data ?? null;

  const updateDraftFilters = (updater: (prev: typeof draftFilters) => typeof draftFilters) => {
    startTransition(() => {
      setDraftFilters(updater);
    });
  };

  const updateDraftExtra = (patch: Partial<SearchExtraFilters>) => {
    updateDraftFilters((prev) => ({
      ...prev,
      extra: {
        ...prev.extra,
        ...patch,
      },
    }));
  };

  const resetCurrentPage = () => {
    setCurrentPageState(1);
    setLoadedPagesFromCurrent(1);
  };

  useEffect(() => {
    if (selectedMapPropertyId == null) {
      return;
    }
    if (mapPins.some((pin) => pin.id === selectedMapPropertyId)) {
      return;
    }
    setSelectedMapPropertyId(undefined);
  }, [mapPins, selectedMapPropertyId]);

  const handleFiltersCommit = () => {
    setUrlFilters(draftFilters);
    setUrlSortMode(draftSortMode);
    resetCurrentPage();
  };

  const handleRentalTypeChange = (value: string) => {
    const nextFilters = {
      ...draftFilters,
      rentalType: parseRentalType(value || null),
    };
    startTransition(() => {
      setDraftFilters(nextFilters);
      setUrlFilters(nextFilters);
      setUrlSortMode(draftSortMode);
      setCurrentPageState(1);
      setLoadedPagesFromCurrent(1);
    });
  };

  const handleRoomsSelect = (value: string) => {
    updateDraftFilters((prev) => ({
      ...prev,
      roomsMin: value,
    }));
  };

  const handleExtraImmediateChange = (patch: Partial<SearchExtraFilters>) => {
    updateDraftExtra(patch);
  };

  const handleSortModeChange = (mode: SearchSortMode) => {
    setDraftSortMode(mode);
  };

  const handleResetAllFilters = () => {
    const empty = createEmptyFormState();
    setDraftFilters(empty);
    setUrlFilters(empty);
    setDraftSortMode('NEWEST');
    setUrlSortMode('NEWEST');
    resetCurrentPage();
    setMapBounds(null);
    setSelectedMapPropertyId(undefined);
  };

  const showMore = () => {
    setLoadedPagesFromCurrent((prev) => Math.min(currentPageMaxSegments, prev + 1));
  };

  const scrollToTop = () => {
    if (typeof window === 'undefined') {
      return;
    }
    window.scrollTo({ top: SCROLL_TOP, behavior: 'smooth' });
  };

  const goPrevPage = () => {
    if (currentPage <= 1) {
      return;
    }
    setCurrentPageState(currentPage - 1);
    setLoadedPagesFromCurrent(1);
    scrollToTop();
  };

  const goNextPage = () => {
    if (currentPage >= totalPages) {
      return;
    }
    setCurrentPageState(currentPage + 1);
    setLoadedPagesFromCurrent(1);
    scrollToTop();
  };

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(totalPages, page));
    if (clamped === currentPage) {
      return;
    }
    setCurrentPageState(clamped);
    setLoadedPagesFromCurrent(1);
    scrollToTop();
  };

  const extraCount = countExtraFilters(draftFilters.extra);

  return {
    cityInput: draftFilters.cityInput,
    rentalType: draftFilters.rentalType,
    priceFrom: draftFilters.priceFrom,
    priceTo: draftFilters.priceTo,
    roomsMin: draftFilters.roomsMin,
    roomsMax: draftFilters.roomsMax,
    areaFrom: draftFilters.areaFrom,
    areaTo: draftFilters.areaTo,
    extra: draftFilters.extra,
    sortMode: draftSortMode,
    viewMode,
    loading: propertiesQuery.isLoading || propertiesQuery.isFetching,
    suggestionsLoading: locationSuggestQuery.isLoading || locationSuggestQuery.isFetching,
    suggestions: locationSuggestQuery.data ?? [],
    amenitiesGrouped: amenitiesGroupedQuery.data ?? [],
    amenitiesLoading: amenitiesGroupedQuery.isLoading || amenitiesGroupedQuery.isFetching,
    error: propertiesQuery.error ? getApiErrorMessage(propertiesQuery.error, 'Не вдалося завантажити оголошення') : null,
    mapPinsLoading: mapPinsQuery.isLoading || mapPinsQuery.isFetching,
    mapPinsError:
      mapPinsQuery.error && mapPins.length === 0
        ? getApiErrorMessage(mapPinsQuery.error, 'Не вдалося завантажити точки на мапі')
        : null,
    mapPins,
    selectedMapPropertyId,
    selectedMapProperty,
    filtered,
    visibleItems,
    currentPage,
    totalPages,
    visibleCount,
    remainingCount,
    hasMoreFromCurrentPage,
    paginationItems,
    favoriteIds,
    extraCount,
    setCityInput: (value: string) =>
      updateDraftFilters((prev) => ({
        ...prev,
        cityInput: value,
        locationType: undefined,
        cityId: undefined,
        districtId: undefined,
        metroStationId: undefined,
        residentialComplexId: undefined,
      })),
    setPriceFrom: (value: string) =>
      updateDraftFilters((prev) => ({
        ...prev,
        priceFrom: value,
      })),
    setPriceTo: (value: string) =>
      updateDraftFilters((prev) => ({
        ...prev,
        priceTo: value,
      })),
    setRoomsMax: (value: string) =>
      updateDraftFilters((prev) => ({
        ...prev,
        roomsMax: value,
      })),
    setAreaFrom: (value: string) =>
      updateDraftFilters((prev) => ({
        ...prev,
        areaFrom: value,
      })),
    setAreaTo: (value: string) =>
      updateDraftFilters((prev) => ({
        ...prev,
        areaTo: value,
      })),
    handleLocationSuggestionSelect: (suggestion: LocationSuggestionDto) => {
      updateDraftFilters((prev) => ({
        ...prev,
        cityInput: suggestion.name,
        locationType: suggestion.type,
        cityId: suggestion.type === 'CITY' ? suggestion.id : suggestion.cityId || undefined,
        districtId: suggestion.type === 'DISTRICT' ? suggestion.id : undefined,
        metroStationId: suggestion.type === 'METRO' ? suggestion.id : undefined,
        residentialComplexId: suggestion.type === 'RESIDENTIAL_COMPLEX' ? suggestion.id : undefined,
      }));
    },
    handleFiltersCommit,
    handleRentalTypeChange,
    handleRoomsSelect,
    handleExtraDraftChange: updateDraftExtra,
    handleExtraImmediateChange,
    handleAmenitySlugToggle: (slug: string) => {
      updateDraftFilters((prev) => {
        const exists = prev.extra.amenitySlugs.includes(slug);
        const amenitySlugs = exists
          ? prev.extra.amenitySlugs.filter((item) => item !== slug)
          : [...prev.extra.amenitySlugs, slug];
        return {
          ...prev,
          extra: {
            ...prev.extra,
            amenitySlugs,
          },
        };
      });
    },
    handleAmenityCategoryToggle: (category: AmenityCategory) => {
      updateDraftFilters((prev) => {
        const exists = prev.extra.amenityCategories.includes(category);
        const amenityCategories = exists
          ? prev.extra.amenityCategories.filter((item) => item !== category)
          : [...prev.extra.amenityCategories, category];
        return {
          ...prev,
          extra: {
            ...prev.extra,
            amenityCategories,
          },
        };
      });
    },
    handleSortModeChange,
    handleResetAllFilters,
    setViewMode: (mode: SearchViewMode) => setViewMode(mode),
    setSelectedMapPropertyId,
    handleMapBoundsChange: (bounds: SearchMapBounds) =>
      startTransition(() => {
        setMapBounds((prev) => (areBoundsEqual(prev, bounds) ? prev : bounds));
      }),
    showMore,
    goPrevPage,
    goNextPage,
    goToPage,
  };
};

export type SearchPageModel = ReturnType<typeof useSearchPage>;
