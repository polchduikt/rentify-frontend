import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAmenitiesGroupedQuery, useLocationSuggestQuery, useSearchPropertiesQuery } from '@/hooks/api';
import type { AmenityCategory } from '@/types/enums';
import type { LocationSuggestionDto } from '@/types/location';
import type { SearchExtraFilters, SearchSortMode, SearchViewMode } from '@/types/search';
import { getApiErrorMessage } from '@/utils/errors';
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

const createEmptyFormState = () => ({
  ...EMPTY_FORM_FILTERS,
  extra: {
    ...EMPTY_FORM_FILTERS.extra,
    amenitySlugs: [],
    amenityCategories: [],
  },
});

export const useSearchPage = () => {
  const [params, setParams] = useSearchParams();

  const [draftFilters, setDraftFilters] = useState(() => createFiltersFromSearchParams(params));
  const [urlFilters, setUrlFilters] = useState(() => createFiltersFromSearchParams(params));
  const [draftSortMode, setDraftSortMode] = useState<SearchSortMode>(() => parseSortMode(params.get('sortMode')));
  const [urlSortMode, setUrlSortMode] = useState<SearchSortMode>(() => parseSortMode(params.get('sortMode')));
  const [viewMode, setViewMode] = useState<SearchViewMode>(() => parseViewMode(params.get('view')));
  const [visiblePages, setVisiblePages] = useState(() => parsePositiveInt(params.get('page')));

  useEffect(() => {
    const next = buildSearchParams(urlFilters, urlSortMode, viewMode, visiblePages);
    if (params.toString() !== next.toString()) {
      setParams(next, { replace: true });
    }
  }, [params, setParams, urlFilters, urlSortMode, viewMode, visiblePages]);

  const criteria = useMemo(() => toCriteria(draftFilters), [draftFilters]);

  const propertiesQuery = useSearchPropertiesQuery(criteria, { page: 0, size: 200, sort: 'createdAt,desc' });
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
    showMore,
    goPrevPage,
    goNextPage,
    goToPage,
  };
};
