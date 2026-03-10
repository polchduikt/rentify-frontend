import type { AmenityCategory, LocationSuggestionType, PropertyMarketType, RentalType } from '@/types/enums';
import type { PropertyResponseDto, PropertySearchCriteriaDto } from '@/types/property';
import type {
  SearchExtraFilters,
  SearchFormState,
  SearchPaginationItem,
  SearchSortMode,
  SearchViewMode,
} from '@/types/search';

export const PAGE_SIZE = 20;

export const EMPTY_EXTRA_FILTERS: SearchExtraFilters = {
  propertyType: undefined,
  marketType: undefined,
  minFloor: '',
  maxFloor: '',
  minTotalFloors: '',
  maxTotalFloors: '',
  minSleepingPlaces: '',
  maxSleepingPlaces: '',
  petsAllowed: false,
  smokingAllowed: false,
  partiesAllowed: false,
  verifiedProperty: false,
  verifiedRealtor: false,
  hideDuplicates: false,
  dateFrom: '',
  dateTo: '',
  amenitySlugs: [],
  amenityCategories: [],
};

export const EMPTY_FORM_FILTERS: SearchFormState = {
  cityInput: '',
  locationType: undefined,
  cityId: undefined,
  districtId: undefined,
  metroStationId: undefined,
  residentialComplexId: undefined,
  rentalType: undefined,
  priceFrom: '',
  priceTo: '',
  roomsMin: '',
  roomsMax: '',
  areaFrom: '',
  areaTo: '',
  extra: EMPTY_EXTRA_FILTERS,
};

const ALLOWED_AMENITY_CATEGORIES: AmenityCategory[] = [
  'BASIC',
  'VERIFICATION',
  'RENOVATION',
  'ACCESSIBILITY',
  'BLACKOUT_SUPPORT',
  'LIVING_CONDITIONS',
  'LAYOUT',
  'WALL_TYPE',
  'HEATING',
  'OFFER_TYPE',
  'RENTAL_TERMS',
  'OTHER',
];

export const parseRentalType = (value: string | null): RentalType | undefined =>
  value === 'SHORT_TERM' || value === 'LONG_TERM' ? value : undefined;

const parseMarketType = (value: string | null): PropertyMarketType | undefined =>
  value === 'SECONDARY' || value === 'NEW_BUILD' ? value : undefined;

export const parseSortMode = (value: string | null): SearchSortMode =>
  value === 'PRICE_ASC' || value === 'PRICE_DESC' || value === 'NEWEST' ? value : 'NEWEST';

export const parseViewMode = (value: string | null): SearchViewMode =>
  value === 'double' || value === 'single' ? value : 'single';

export const parsePositiveInt = (value: string | null, fallback = 1): number => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0 ? num : fallback;
};

const parseNumberOrUndefined = (value: string | null): number | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseBool = (value: string | null): boolean => value === '1' || value === 'true';

const parseLocationType = (value: string | null): LocationSuggestionType | undefined =>
  value === 'CITY' || value === 'DISTRICT' || value === 'METRO' || value === 'RESIDENTIAL_COMPLEX'
    ? value
    : undefined;

const parseAmenityCategories = (value: string | null): AmenityCategory[] => {
  if (!value) {
    return [];
  }
  const allowedSet = new Set(ALLOWED_AMENITY_CATEGORIES);
  return value
    .split(',')
    .map((item) => item.trim() as AmenityCategory)
    .filter((item) => allowedSet.has(item));
};

const parseStringList = (value: string | null): string[] =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const toFiniteNumber = (value: string): number | undefined => {
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const createFiltersFromSearchParams = (params: URLSearchParams): SearchFormState => ({
  cityInput: params.get('city')?.trim() ?? '',
  locationType: parseLocationType(params.get('locationType')),
  cityId: parseNumberOrUndefined(params.get('cityId')),
  districtId: parseNumberOrUndefined(params.get('districtId')),
  metroStationId: parseNumberOrUndefined(params.get('metroStationId')),
  residentialComplexId: parseNumberOrUndefined(params.get('residentialComplexId')),
  rentalType: parseRentalType(params.get('rentalType')),
  priceFrom: params.get('priceFrom')?.trim() ?? '',
  priceTo: params.get('priceTo')?.trim() ?? '',
  roomsMin: params.get('roomsMin')?.trim() ?? '',
  roomsMax: params.get('roomsMax')?.trim() ?? '',
  areaFrom: params.get('areaFrom')?.trim() ?? '',
  areaTo: params.get('areaTo')?.trim() ?? '',
  extra: {
    propertyType: params.get('propertyType')?.trim() || undefined,
    marketType: parseMarketType(params.get('marketType')),
    minFloor: params.get('minFloor')?.trim() ?? '',
    maxFloor: params.get('maxFloor')?.trim() ?? '',
    minTotalFloors: params.get('minTotalFloors')?.trim() ?? '',
    maxTotalFloors: params.get('maxTotalFloors')?.trim() ?? '',
    minSleepingPlaces: params.get('minSleepingPlaces')?.trim() ?? '',
    maxSleepingPlaces: params.get('maxSleepingPlaces')?.trim() ?? '',
    petsAllowed: parseBool(params.get('petsAllowed')),
    smokingAllowed: parseBool(params.get('smokingAllowed')),
    partiesAllowed: parseBool(params.get('partiesAllowed')),
    verifiedProperty: parseBool(params.get('verifiedProperty')),
    verifiedRealtor: parseBool(params.get('verifiedRealtor')),
    hideDuplicates: parseBool(params.get('hideDuplicates')),
    dateFrom: params.get('dateFrom')?.trim() ?? '',
    dateTo: params.get('dateTo')?.trim() ?? '',
    amenitySlugs: parseStringList(params.get('amenitySlugs')),
    amenityCategories: parseAmenityCategories(params.get('amenityCategories')),
  },
});

export const buildSearchParams = (
  filters: SearchFormState,
  sortMode: SearchSortMode,
  viewMode: SearchViewMode,
  page: number
) => {
  const next = new URLSearchParams();
  const city = filters.cityInput.trim();

  if (city) next.set('city', city);
  if (filters.locationType) next.set('locationType', filters.locationType);
  if (filters.cityId != null) next.set('cityId', String(filters.cityId));
  if (filters.districtId != null) next.set('districtId', String(filters.districtId));
  if (filters.metroStationId != null) next.set('metroStationId', String(filters.metroStationId));
  if (filters.residentialComplexId != null) next.set('residentialComplexId', String(filters.residentialComplexId));
  if (filters.rentalType) next.set('rentalType', filters.rentalType);
  if (filters.priceFrom.trim()) next.set('priceFrom', filters.priceFrom.trim());
  if (filters.priceTo.trim()) next.set('priceTo', filters.priceTo.trim());
  if (filters.roomsMin.trim()) next.set('roomsMin', filters.roomsMin.trim());
  if (filters.roomsMax.trim()) next.set('roomsMax', filters.roomsMax.trim());
  if (filters.areaFrom.trim()) next.set('areaFrom', filters.areaFrom.trim());
  if (filters.areaTo.trim()) next.set('areaTo', filters.areaTo.trim());
  if (filters.extra.propertyType) next.set('propertyType', filters.extra.propertyType);
  if (filters.extra.marketType) next.set('marketType', filters.extra.marketType);
  if (filters.extra.minFloor.trim()) next.set('minFloor', filters.extra.minFloor.trim());
  if (filters.extra.maxFloor.trim()) next.set('maxFloor', filters.extra.maxFloor.trim());
  if (filters.extra.minTotalFloors.trim()) next.set('minTotalFloors', filters.extra.minTotalFloors.trim());
  if (filters.extra.maxTotalFloors.trim()) next.set('maxTotalFloors', filters.extra.maxTotalFloors.trim());
  if (filters.extra.minSleepingPlaces.trim()) next.set('minSleepingPlaces', filters.extra.minSleepingPlaces.trim());
  if (filters.extra.maxSleepingPlaces.trim()) next.set('maxSleepingPlaces', filters.extra.maxSleepingPlaces.trim());
  if (filters.extra.petsAllowed) next.set('petsAllowed', '1');
  if (filters.extra.smokingAllowed) next.set('smokingAllowed', '1');
  if (filters.extra.partiesAllowed) next.set('partiesAllowed', '1');
  if (filters.extra.verifiedProperty) next.set('verifiedProperty', '1');
  if (filters.extra.verifiedRealtor) next.set('verifiedRealtor', '1');
  if (filters.extra.hideDuplicates) next.set('hideDuplicates', '1');
  if (filters.extra.dateFrom) next.set('dateFrom', filters.extra.dateFrom);
  if (filters.extra.dateTo) next.set('dateTo', filters.extra.dateTo);
  if (filters.extra.amenitySlugs.length) next.set('amenitySlugs', filters.extra.amenitySlugs.join(','));
  if (filters.extra.amenityCategories.length) {
    next.set('amenityCategories', filters.extra.amenityCategories.join(','));
  }
  if (sortMode !== 'NEWEST') next.set('sortMode', sortMode);
  if (viewMode !== 'single') next.set('view', viewMode);
  if (page > 1) next.set('page', String(page));

  return next;
};

export const toCriteria = (filters: SearchFormState): PropertySearchCriteriaDto => ({
  city: filters.cityInput.trim() || undefined,
  cityId: filters.cityId,
  districtId: filters.districtId,
  metroStationId: filters.metroStationId,
  residentialComplexId: filters.residentialComplexId,
  rentalType: filters.rentalType,
  minPrice: toFiniteNumber(filters.priceFrom),
  maxPrice: toFiniteNumber(filters.priceTo),
  minRooms: toFiniteNumber(filters.roomsMin),
  maxRooms: toFiniteNumber(filters.roomsMax),
  minArea: toFiniteNumber(filters.areaFrom),
  maxArea: toFiniteNumber(filters.areaTo),
  propertyType: filters.extra.propertyType,
  marketType: filters.extra.marketType,
  minFloor: toFiniteNumber(filters.extra.minFloor),
  maxFloor: toFiniteNumber(filters.extra.maxFloor),
  minTotalFloors: toFiniteNumber(filters.extra.minTotalFloors),
  maxTotalFloors: toFiniteNumber(filters.extra.maxTotalFloors),
  minSleepingPlaces: toFiniteNumber(filters.extra.minSleepingPlaces),
  maxSleepingPlaces: toFiniteNumber(filters.extra.maxSleepingPlaces),
  dateFrom: filters.extra.dateFrom || undefined,
  dateTo: filters.extra.dateTo || undefined,
  petsAllowed: filters.extra.petsAllowed ? true : undefined,
  verifiedProperty: filters.extra.verifiedProperty ? true : undefined,
  verifiedRealtor: filters.extra.verifiedRealtor ? true : undefined,
  hideDuplicates: filters.extra.hideDuplicates ? true : undefined,
  amenitySlugs: filters.extra.amenitySlugs.length ? filters.extra.amenitySlugs : undefined,
  amenityCategories: filters.extra.amenityCategories.length ? filters.extra.amenityCategories : undefined,
});

export const applyClientOnlyFilters = (properties: PropertyResponseDto[], filters: SearchFormState) =>
  properties.filter((property) => {
    if (filters.extra.smokingAllowed && !property.rules?.smokingAllowed) {
      return false;
    }
    if (filters.extra.partiesAllowed && !property.rules?.partiesAllowed) {
      return false;
    }
    return true;
  });

export const resolvePropertyPriceValue = (property: PropertyResponseDto): number => {
  const hasNightlyPrice = (property.pricing?.pricePerNight ?? 0) > 0;
  const hasMonthlyPrice = (property.pricing?.pricePerMonth ?? 0) > 0;
  const isShort = property.rentalType === 'SHORT_TERM' || (!property.rentalType && hasNightlyPrice && !hasMonthlyPrice);
  return Number(isShort ? property.pricing?.pricePerNight : property.pricing?.pricePerMonth) || 0;
};

export const sortProperties = (properties: PropertyResponseDto[], sortMode: SearchSortMode) =>
  [...properties].sort((leftProperty, rightProperty) => {
    if (sortMode === 'NEWEST') {
      const left = leftProperty.createdAt ? new Date(leftProperty.createdAt).getTime() : 0;
      const right = rightProperty.createdAt ? new Date(rightProperty.createdAt).getTime() : 0;
      return right - left;
    }

    const left = resolvePropertyPriceValue(leftProperty);
    const right = resolvePropertyPriceValue(rightProperty);
    return sortMode === 'PRICE_ASC' ? left - right : right - left;
  });

export const buildPagination = (currentPage: number, totalPages: number): SearchPaginationItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: SearchPaginationItem[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    items.push('dots-left');
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push('dots-right');
  }

  items.push(totalPages);
  return items;
};

export const countExtraFilters = (filters: SearchExtraFilters): number =>
  [
    filters.propertyType,
    filters.marketType,
    filters.minFloor,
    filters.maxFloor,
    filters.minTotalFloors,
    filters.maxTotalFloors,
    filters.minSleepingPlaces,
    filters.maxSleepingPlaces,
    filters.petsAllowed,
    filters.smokingAllowed,
    filters.partiesAllowed,
    filters.verifiedProperty,
    filters.verifiedRealtor,
    filters.hideDuplicates,
    filters.dateFrom,
    filters.dateTo,
    filters.amenitySlugs.length,
    filters.amenityCategories.length,
  ].filter(Boolean).length;
