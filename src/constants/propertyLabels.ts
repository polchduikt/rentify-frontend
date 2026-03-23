import type { AmenityCategory, LocationSuggestionType, PropertyMarketType, RentalType } from '@/types/enums';

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Квартира',
  HOUSE: 'Будинок',
  ROOM: 'Кімната',
  STUDIO: 'Студія',
  PENTHOUSE: 'Пентхаус',
  TOWNHOUSE: 'Таунхаус',
};

export const PROPERTY_TYPE_OPTIONS: ReadonlyArray<{ value: string; label: string }> = Object.entries(PROPERTY_TYPE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const MARKET_TYPE_LABELS: Record<PropertyMarketType, string> = {
  SECONDARY: 'Вторинний ринок',
  NEW_BUILD: 'Новобудова',
};

export const MARKET_TYPE_OPTIONS: ReadonlyArray<{ value: PropertyMarketType; label: string }> = [
  { value: 'SECONDARY', label: MARKET_TYPE_LABELS.SECONDARY },
  { value: 'NEW_BUILD', label: MARKET_TYPE_LABELS.NEW_BUILD },
];

export const RENTAL_TYPE_LABELS: Record<RentalType, string> = {
  SHORT_TERM: 'Подобово',
  LONG_TERM: 'Довгостроково',
};

export const AMENITY_CATEGORY_LABELS: Record<AmenityCategory, string> = {
  BASIC: 'Базові',
  VERIFICATION: 'Верифікація',
  RENOVATION: 'Ремонт',
  ACCESSIBILITY: 'Доступність',
  BLACKOUT_SUPPORT: 'Під час блекаутів',
  LIVING_CONDITIONS: 'Умови проживання',
  LAYOUT: 'Планування',
  WALL_TYPE: 'Тип стін',
  HEATING: 'Опалення',
  OFFER_TYPE: 'Тип пропозиції',
  RENTAL_TERMS: 'Умови оренди',
  OTHER: 'Інше',
};

export const LOCATION_TYPE_LABELS: Record<LocationSuggestionType, string> = {
  CITY: 'Місто',
  DISTRICT: 'Район',
  METRO: 'Метро',
  RESIDENTIAL_COMPLEX: 'ЖК',
};
