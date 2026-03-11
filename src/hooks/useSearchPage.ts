import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useAmenitiesGroupedQuery,
  useLocationSuggestQuery,
  usePropertyByIdQuery,
  useSearchPropertiesQuery,
  useSearchPropertyMapPinsQuery,
} from '@/hooks/api';
import type { AmenityCategory } from '@/types/enums';
import type { LocationSuggestionDto } from '@/types/location';
import type { PropertyResponseDto } from '@/types/property';
import type { SearchExtraFilters, SearchMapBounds, SearchSortMode, SearchViewMode } from '@/types/search';
import { getApiErrorMessage } from '@/utils/errors';
import { buildFallbackMapPins, enrichMapPinsWithRooms } from './search/mapPins';
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
} from './search/searchPageUtils';

const MAP_PINS_PAGE_SIZE = 300;

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
  const [params, setParams] = useSearchParams();

  const [draftFilters, setDraftFilters] = useState(() => createFiltersFromSearchParams(params));
  const [urlFilters, setUrlFilters] = useState(() => createFiltersFromSearchParams(params));
  const [draftSortMode, setDraftSortMode] = useState<SearchSortMode>(() => parseSortMode(params.get('sortMode')));
  const [urlSortMode, setUrlSortMode] = useState<SearchSortMode>(() => parseSortMode(params.get('sortMode')));
  const [viewMode, setViewMode] = useState<SearchViewMode>(() => parseViewMode(params.get('view')));
  const [visiblePages, setVisiblePages] = useState(() => parsePositiveInt(params.get('page')));
  const [mapBounds, setMapBounds] = useState<SearchMapBounds | null>(null);
  const [selectedMapPropertyId, setSelectedMapPropertyId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const next = buildSearchParams(urlFilters, urlSortMode, viewMode, visiblePages);
    if (params.toString() !== next.toString()) {
      setParams(next, { replace: true });
    }
  }, [params, setParams, urlFilters, urlSortMode, viewMode, visiblePages]);

  const criteria = useMemo(() => toCriteria(draftFilters), [draftFilters]);
  const mapCriteria = useMemo(
    () => ({
      ...criteria,
      ...(mapBounds ?? {}),
    }),
    [criteria, mapBounds]
  );

  const propertiesQuery = useSearchPropertiesQuery(criteria, { page: 0, size: 200, sort: 'createdAt,desc' });
  const mapPinsQuery = useSearchPropertyMapPinsQuery(
    mapCriteria,
    { page: 0, size: MAP_PINS_PAGE_SIZE, sort: 'createdAt,desc' },
    viewMode === 'map'
  );
  const locationSuggestQuery = useLocationSuggestQuery(
    { q: draftFilters.cityInput, limit: 10 },
    draftFilters.cityInput.trim().length >= 2
  );
  const amenitiesGroupedQuery = useAmenitiesGroupedQuery();

  const filtered = useMemo(() => {
    const source = propertiesQuery.data?.content ?? [];
    const withClientRules = applyClientOnlyFilters(source, draftFilters);
    return sortProperties(withClientRules, draftSortMode);
  }, [propertiesQuery.data?.content, draftFilters, draftSortMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(visiblePages, totalPages);
  const visibleCount = Math.min(filtered.length, currentPage * PAGE_SIZE);
  const visibleItems = filtered.slice(0, visibleCount);
  const paginationItems = buildPagination(currentPage, totalPages);

  const fallbackMapPins = useMemo(() => buildFallbackMapPins(filtered), [filtered]);
  const mapPins = useMemo(() => {
    const serverPins = mapPinsQuery.data?.content ?? [];
    return enrichMapPinsWithRooms(serverPins.length > 0 ? serverPins : fallbackMapPins, filtered);
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
    setVisiblePages(1);
  };

  const handleRentalTypeChange = (value: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      rentalType: parseRentalType(value || null),
    }));
  };

  const handleRoomsSelect = (value: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      roomsMin: value,
    }));
  };

  const handleExtraImmediateChange = (patch: Partial<SearchExtraFilters>) => {
    setDraftFilters((prev) => ({
      ...prev,
      extra: {
        ...prev.extra,
        ...patch,
      },
    }));
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
    setVisiblePages(1);
    setMapBounds(null);
    setSelectedMapPropertyId(undefined);
  };

  const showMore = () => {
    setVisiblePages((prev) => Math.min(totalPages, prev + 1));
  };

  const goPrevPage = () => {
    setVisiblePages((prev) => Math.max(1, prev - 1));
  };

  const goNextPage = () => {
    setVisiblePages((prev) => Math.min(totalPages, prev + 1));
  };

  const goToPage = (page: number) => {
    setVisiblePages(page);
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
    paginationItems,
    extraCount,
    setCityInput: (value: string) =>
      setDraftFilters((prev) => ({
        ...prev,
        cityInput: value,
        locationType: undefined,
        cityId: undefined,
        districtId: undefined,
        metroStationId: undefined,
        residentialComplexId: undefined,
      })),
    setPriceFrom: (value: string) =>
      setDraftFilters((prev) => ({
        ...prev,
        priceFrom: value,
      })),
    setPriceTo: (value: string) =>
      setDraftFilters((prev) => ({
        ...prev,
        priceTo: value,
      })),
    setRoomsMax: (value: string) =>
      setDraftFilters((prev) => ({
        ...prev,
        roomsMax: value,
      })),
    setAreaFrom: (value: string) =>
      setDraftFilters((prev) => ({
        ...prev,
        areaFrom: value,
      })),
    setAreaTo: (value: string) =>
      setDraftFilters((prev) => ({
        ...prev,
        areaTo: value,
      })),
    handleLocationSuggestionSelect: (suggestion: LocationSuggestionDto) => {
      setDraftFilters((prev) => ({
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
    handleExtraDraftChange: (patch: Partial<SearchExtraFilters>) =>
      setDraftFilters((prev) => ({
        ...prev,
        extra: {
          ...prev.extra,
          ...patch,
        },
      })),
    handleExtraImmediateChange,
    handleAmenitySlugToggle: (slug: string) => {
      setDraftFilters((prev) => {
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
      setDraftFilters((prev) => {
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
      setMapBounds((prev) => (areBoundsEqual(prev, bounds) ? prev : bounds)),
    showMore,
    goPrevPage,
    goNextPage,
    goToPage,
  };
};
