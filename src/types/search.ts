import type { AmenityCategory, LocationSuggestionType, PropertyMarketType, RentalType } from './enums';

export type SearchViewMode = 'single' | 'double' | 'map';

export type SearchSortMode = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC';

export type SearchMainPanel = 'price' | 'rooms' | 'area' | null;

export type SearchPaginationItem = number | 'dots-left' | 'dots-right';

export interface SearchMapBounds {
  southWestLat: number;
  southWestLng: number;
  northEastLat: number;
  northEastLng: number;
}

export interface SearchExtraFilters {
  propertyType?: string;
  marketType?: PropertyMarketType;
  minFloor: string;
  maxFloor: string;
  minTotalFloors: string;
  maxTotalFloors: string;
  minSleepingPlaces: string;
  maxSleepingPlaces: string;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  verifiedProperty: boolean;
  verifiedRealtor: boolean;
  hideDuplicates: boolean;
  dateFrom: string;
  dateTo: string;
  amenitySlugs: string[];
  amenityCategories: AmenityCategory[];
}

export interface SearchFormState {
  cityInput: string;
  locationType?: LocationSuggestionType;
  cityId?: number;
  districtId?: number;
  metroStationId?: number;
  residentialComplexId?: number;
  rentalType?: RentalType;
  priceFrom: string;
  priceTo: string;
  roomsMin: string;
  roomsMax: string;
  areaFrom: string;
  areaTo: string;
  extra: SearchExtraFilters;
}
