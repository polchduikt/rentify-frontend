import type { AmenityCategory } from '@/types/enums';

export const PROPERTY_CREATE_STEP_TITLES = [
  'Базова інформація',
  'Адреса і карта',
  'Характеристики',
  'Зручності та фото',
  'Ціна і публікація',
] as const;

export const PROPERTY_CREATE_STEP_DESCRIPTIONS = [
  'Тип оренди, тип нерухомості, заголовок та опис',
  'Локація, адреса, точка на карті',
  'Площа, кімнати, правила і додаткові параметри',
  "Зручності та фото об'єкта",
  'Ціни, календар недоступності та публікація',
] as const;

export const PROPERTY_CREATE_INPUT_CLASS =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500';

export const PROPERTY_CREATE_LABEL_CLASS = 'mb-1.5 block text-sm font-medium text-slate-700';

export const PROPERTY_CREATE_AMENITY_CATEGORY_LABELS: Record<AmenityCategory, string> = {
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
