import type { AmenityCategory } from '@/types/enums';

export const COLLAPSIBLE_LIMIT = 6;

export const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Квартира' },
  { value: 'HOUSE', label: 'Будинок' },
  { value: 'ROOM', label: 'Кімната' },
  { value: 'STUDIO', label: 'Студія' },
] as const;

export const CATEGORY_LABELS: Record<AmenityCategory, string> = {
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

export const LOCATION_TYPE_LABELS: Record<string, string> = {
  CITY: 'Місто',
  DISTRICT: 'Район',
  METRO: 'Метро',
  RESIDENTIAL_COMPLEX: 'ЖК',
};
