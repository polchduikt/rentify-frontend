import type { PropertyMarketType, RentalType } from '@/types/enums';

export const RENTAL_TYPE_OPTIONS: Array<{ value: RentalType; label: string; description: string }> = [
  {
    value: 'LONG_TERM',
    label: 'Довгостроково',
    description: 'Оренда на місяці, ціна за місяць',
  },
  {
    value: 'SHORT_TERM',
    label: 'Подобово',
    description: 'Короткі заїзди, ціна за ніч',
  },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'APARTMENT', label: 'Квартира' },
  { value: 'HOUSE', label: 'Будинок' },
  { value: 'ROOM', label: 'Кімната' },
  { value: 'STUDIO', label: 'Студія' },
  { value: 'PENTHOUSE', label: 'Пентхаус' },
  { value: 'TOWNHOUSE', label: 'Таунхаус' },
] as const;

export const MARKET_TYPE_OPTIONS: Array<{ value: PropertyMarketType; label: string }> = [
  { value: 'SECONDARY', label: 'Вторинний ринок' },
  { value: 'NEW_BUILD', label: 'Новобудова' },
];

export const DEFAULT_MAP_CENTER = {
  lat: 50.450001,
  lng: 30.523333,
};
