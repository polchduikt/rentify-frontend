import type { LocationSuggestionDto } from '@/types/location';
import type { PropertyPhotoDto, PropertyResponseDto } from '@/types/property';
import type { PropertyCreateFormValues } from '@/types/propertyCreate';
import type { PropertyLocationRefIds } from '@/utils/propertyCreate';

const KNOWN_PROPERTY_TYPES = new Set([
  'APARTMENT',
  'HOUSE',
  'ROOM',
  'STUDIO',
  'LOFT',
  'PENTHOUSE',
  'TOWNHOUSE',
  'VILLA',
  'OTHER',
]);

const toOptionalText = (value: unknown) => (typeof value === 'string' ? value : '');

const toTextValue = (value: unknown) => {
  if (value == null) {
    return '';
  }
  return String(value);
};

const normalizeRentalType = (property: PropertyResponseDto): 'LONG_TERM' | 'SHORT_TERM' => {
  const rawType = String((property as { rentalType?: unknown }).rentalType ?? '')
    .trim()
    .toUpperCase();

  if (rawType.includes('SHORT') || rawType.includes('DAILY') || rawType.includes('DAY')) {
    return 'SHORT_TERM';
  }
  if (rawType.includes('LONG') || rawType.includes('MONTH')) {
    return 'LONG_TERM';
  }

  const hasShortTermSignals =
    Number(property.maxGuests ?? 0) > 0 ||
    Boolean(property.checkInTime) ||
    Boolean(property.checkOutTime) ||
    Number(property.pricing?.pricePerNight ?? 0) > 0;

  return hasShortTermSignals ? 'SHORT_TERM' : 'LONG_TERM';
};

const normalizePropertyType = (value: unknown): string => {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase();
  return KNOWN_PROPERTY_TYPES.has(normalized) ? normalized : '';
};

export const sortPropertyPhotos = (photos: PropertyPhotoDto[]) =>
  [...photos].sort((left, right) => {
    const leftOrder = Number(left.sortOrder ?? 0);
    const rightOrder = Number(right.sortOrder ?? 0);
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return Number(left.id) - Number(right.id);
  });

export const toLocationRefIdsFromSuggestion = (suggestion?: LocationSuggestionDto): PropertyLocationRefIds => {
  if (!suggestion) {
    return {};
  }

  if (suggestion.type === 'CITY') {
    return { cityId: suggestion.id };
  }
  if (suggestion.type === 'DISTRICT') {
    return { cityId: suggestion.cityId, districtId: suggestion.id };
  }
  if (suggestion.type === 'METRO') {
    return { cityId: suggestion.cityId, metroStationId: suggestion.id };
  }
  return { cityId: suggestion.cityId, residentialComplexId: suggestion.id };
};

export const toLocationRefIdsFromProperty = (property: PropertyResponseDto): PropertyLocationRefIds => ({
  cityId: property.address?.cityId,
  districtId: property.address?.districtId,
  metroStationId: property.address?.metroStationId,
  residentialComplexId: property.address?.residentialComplexId,
});

export const toFormValuesFromProperty = (property: PropertyResponseDto): PropertyCreateFormValues => ({
  rentalType: normalizeRentalType(property),
  propertyType: normalizePropertyType(property.propertyType),
  marketType: property.marketType,
  title: toOptionalText(property.title),
  description: toOptionalText(property.description),
  cityQuery: toOptionalText(property.address?.city),
  country: toOptionalText(property.address?.country) || 'Ukraine',
  region: toOptionalText(property.address?.region),
  city: toOptionalText(property.address?.city),
  street: toOptionalText(property.address?.street),
  houseNumber: toOptionalText(property.address?.houseNumber),
  apartment: toOptionalText(property.address?.apartment),
  postalCode: toOptionalText(property.address?.postalCode),
  lat: toTextValue(property.address?.lat),
  lng: toTextValue(property.address?.lng),
  rooms: toTextValue(property.rooms),
  floor: toTextValue(property.floor),
  totalFloors: toTextValue(property.totalFloors),
  areaSqm: toTextValue(property.areaSqm),
  maxGuests: toTextValue(property.maxGuests),
  checkInTime: toOptionalText(property.checkInTime),
  checkOutTime: toOptionalText(property.checkOutTime),
  petsAllowed: Boolean(property.rules?.petsAllowed),
  smokingAllowed: Boolean(property.rules?.smokingAllowed),
  partiesAllowed: Boolean(property.rules?.partiesAllowed),
  additionalRules: toOptionalText(property.rules?.additionalRules),
  isVerifiedProperty: Boolean(property.isVerifiedProperty),
  isVerifiedRealtor: Boolean(property.isVerifiedRealtor),
  isDuplicate: Boolean(property.isDuplicate),
  pricePerNight: toTextValue(property.pricing?.pricePerNight),
  pricePerMonth: toTextValue(property.pricing?.pricePerMonth),
  securityDeposit: toTextValue(property.pricing?.securityDeposit),
  cleaningFee: toTextValue(property.pricing?.cleaningFee),
  currency: toOptionalText(property.pricing?.currency) || 'UAH',
});
