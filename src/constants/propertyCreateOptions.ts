import type { RentalType } from '@/types/enums';
import { MARKET_TYPE_OPTIONS, PROPERTY_TYPE_OPTIONS } from '@/constants/propertyLabels';

export { MARKET_TYPE_OPTIONS, PROPERTY_TYPE_OPTIONS };

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

export const DEFAULT_MAP_CENTER = {
  lat: 50.450001,
  lng: 30.523333,
};
