import { useMemo } from 'react';
import { createPricePinIcon, formatMapPinLabel } from '@/utils/searchMap';
import type { PropertyMapPinDto } from '@/types/property';

export const usePricePinIcons = (pins: PropertyMapPinDto[], selectedPropertyId?: number) =>
  useMemo(
    () =>
      new Map(
        pins.map((pin) => [pin.id, createPricePinIcon(formatMapPinLabel(pin), pin.id === selectedPropertyId)] as const)
      ),
    [pins, selectedPropertyId]
  );
