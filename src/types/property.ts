import type { AmenityCategory, BookingStatus, PropertyMarketType, PropertyStatus, RentalType } from './enums';
import type { Decimal, LocalDateString, LocalTimeString, ZonedDateTimeString } from './scalars';

export interface AddressDto {
  id?: number;
  country?: string;
  region?: string;
  city?: string;
  cityId?: number;
  districtId?: number;
  metroStationId?: number;
  residentialComplexId?: number;
  districtName?: string;
  metroStationName?: string;
  residentialComplexName?: string;
  street: string;
  houseNumber?: string;
  apartment?: string;
  postalCode?: string;
  lat?: Decimal;
  lng?: Decimal;
}

export interface AmenityDto {
  id: number;
  name: string;
  category: AmenityCategory;
  slug: string;
  icon: string;
}

export interface AmenityCategoryGroupDto {
  category: AmenityCategory;
  amenities: AmenityDto[];
}

export interface AvailabilityBlockDto {
  id: number;
  propertyId: number;
  dateFrom: LocalDateString;
  dateTo: LocalDateString;
  reason: string;
  createdById: number;
  createdAt: ZonedDateTimeString;
}

export interface AvailabilityBlockRequestDto {
  dateFrom: LocalDateString;
  dateTo: LocalDateString;
  reason?: string;
}



export interface PropertyCreateRequestDto {
  address: AddressDto;
  title: string;
  description?: string;
  rentalType: RentalType;
  propertyType: string;
  marketType?: PropertyMarketType;
  isVerifiedProperty?: boolean;
  isVerifiedRealtor?: boolean;
  isDuplicate?: boolean;
  rooms?: number;
  floor?: number;
  totalFloors?: number;
  areaSqm?: Decimal;
  maxGuests?: number;
  checkInTime?: LocalTimeString;
  checkOutTime?: LocalTimeString;
  amenityIds?: number[];
  amenitySlugs?: string[];
  pricing?: PropertyPricingDto;
  rules?: PropertyRuleDto;
}

export interface PropertyPhotoDto {
  id: number;
  url: string;
  sortOrder: number;
  createdAt: ZonedDateTimeString;
}

export interface PropertyMapPinDto {
  id: number;
  title: string;
  propertyType: string;
  marketType: PropertyMarketType;
  rentalType: RentalType;
  rooms?: number;
  lat: Decimal;
  lng: Decimal;
  price: Decimal;
  currency: string;
  isTopPromoted: boolean;
  averageRating: Decimal;
  reviewCount: number;
}

export interface PropertyPricingDto {
  id?: number;
  pricePerNight?: Decimal;
  pricePerMonth?: Decimal;
  currency: string;
  securityDeposit?: Decimal;
  cleaningFee?: Decimal;
  updatedAt?: ZonedDateTimeString;
}

export interface PropertyResponseDto {
  id: number;
  hostId: number;
  address: AddressDto;
  title: string;
  description: string;
  rentalType: RentalType;
  status: PropertyStatus;
  propertyType: string;
  marketType: PropertyMarketType;
  isVerifiedProperty: boolean;
  isVerifiedRealtor: boolean;
  isDuplicate: boolean;
  isTopPromoted: boolean;
  viewCount: number;
  reviewCount: number;
  averageRating: Decimal;
  topPromotedUntil: ZonedDateTimeString;
  rooms: number;
  floor: number;
  totalFloors: number;
  areaSqm: Decimal;
  maxGuests: number;
  checkInTime: LocalTimeString;
  checkOutTime: LocalTimeString;
  pricing: PropertyPricingDto;
  rules: PropertyRuleDto;
  photos: PropertyPhotoDto[];
  amenities: AmenityDto[];
  createdAt: ZonedDateTimeString;
  updatedAt: ZonedDateTimeString;
}

export interface PropertyRuleDto {
  id?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  partiesAllowed?: boolean;
  additionalRules?: string;
}

export interface PropertyIdentitySearchCriteria {
  propertyId?: number;
  hostId?: number;
}

export interface PropertyLocationSearchCriteria {
  cityId?: number;
  districtId?: number;
  metroStationId?: number;
  residentialComplexId?: number;
  country?: string;
  region?: string;
  city?: string;
}

export interface GeoSearchCriteria {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  southWestLat?: number;
  southWestLng?: number;
  northEastLat?: number;
  northEastLng?: number;
}

export interface PriceSearchCriteria {
  minPrice?: Decimal;
  maxPrice?: Decimal;
}

export interface PropertySizeSearchCriteria {
  minRooms?: number;
  maxRooms?: number;
  minFloor?: number;
  maxFloor?: number;
  minTotalFloors?: number;
  maxTotalFloors?: number;
  minSleepingPlaces?: number;
  maxSleepingPlaces?: number;
  minArea?: number;
  maxArea?: number;
}

export interface PropertyAvailabilitySearchCriteria {
  dateFrom?: LocalDateString;
  dateTo?: LocalDateString;
}

export interface PropertyAttributeSearchCriteria {
  rentalType?: RentalType;
  marketType?: PropertyMarketType;
  propertyType?: string;
  verifiedProperty?: boolean;
  verifiedRealtor?: boolean;
  hideDuplicates?: boolean;
  petsAllowed?: boolean;
}

export interface PropertyAmenitySearchCriteria {
  amenityIds?: number[];
  amenitySlugs?: string[];
  amenityCategories?: AmenityCategory[];
}

export type PropertySearchCriteriaDto =
  PropertyIdentitySearchCriteria &
  PropertyLocationSearchCriteria &
  GeoSearchCriteria &
  PriceSearchCriteria &
  PropertySizeSearchCriteria &
  PropertyAvailabilitySearchCriteria &
  PropertyAttributeSearchCriteria &
  PropertyAmenitySearchCriteria;

export interface PropertyStatusUpdateRequestDto {
  status: PropertyStatus;
}

export interface UnavailableDateRangeDto {
  dateFrom: LocalDateString;
  dateTo: LocalDateString;
  source: string;
  bookingStatus: BookingStatus | null;
  reason?: string | null;
}
