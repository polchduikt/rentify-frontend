import L from 'leaflet';
import { resolvePropertyPriceValue } from '@/utils/search/searchPageUtils';
import type { PropertyMapPinDto, PropertyResponseDto } from '@/types/property';

export const toFiniteNumber = (value: unknown): number | null => {
  const parsed =
    typeof value === 'string'
      ? Number(value.trim().replace(',', '.'))
      : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const toPinPosition = (pin: PropertyMapPinDto): [number, number] | null => {
  const lat = toFiniteNumber(pin.lat);
  const lng = toFiniteNumber(pin.lng);
  return lat != null && lng != null ? [lat, lng] : null;
};

export const resolveRoomsFromTitle = (title: string): string | null => {
  const match = title.match(/(\d+)\s*(?:[kк]|кім)/iu);
  return match ? `${match[1]}к` : null;
};

export const resolveCurrencyLabel = (currency: string | undefined): string => {
  if (!currency) {
    return 'грн';
  }
  return currency.toUpperCase() === 'UAH' ? 'грн' : currency;
};

export const formatMapPinLabel = (pin: PropertyMapPinDto): string => {
  const numericPrice = toFiniteNumber(pin.price);
  const currency = resolveCurrencyLabel(pin.currency);
  const priceLabel = numericPrice != null && numericPrice > 0 ? `${numericPrice.toLocaleString('uk-UA')} ${currency}` : `0 ${currency}`;

  const directRooms = toFiniteNumber(pin.rooms);
  if (directRooms != null && directRooms > 0) {
    return `${priceLabel} ${directRooms}к`;
  }

  const titleRooms = resolveRoomsFromTitle(pin.title);
  return titleRooms ? `${priceLabel} ${titleRooms}` : priceLabel;
};

export const createPricePinIcon = (label: string, active: boolean) => {
  const minWidth = Math.max(68, label.length * 8 + 18);
  return L.divIcon({
    className: 'rentify-map-price-pin',
    html: `<span class="rentify-map-price-pin__label ${active ? 'rentify-map-price-pin__label--active' : ''}">${label}</span><span class="rentify-map-price-pin__point ${active ? 'rentify-map-price-pin__point--active' : ''}"></span>`,
    iconSize: [minWidth, 44],
    iconAnchor: [Math.floor(minWidth / 2), 44],
  });
};

export const createClusterPinIcon = (count: number, active: boolean) =>
  L.divIcon({
    className: 'rentify-map-cluster-pin',
    html: `<span class="rentify-map-cluster-pin__badge ${active ? 'rentify-map-cluster-pin__badge--active' : ''}">${count}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });

export interface MapPropertyPrice {
  value: number;
  suffix: string;
  currency: string;
}

export const resolveMapPropertyPrice = (property: PropertyResponseDto | null): MapPropertyPrice => {
  if (!property) {
    return { value: 0, suffix: '', currency: 'грн' };
  }
  const value = resolvePropertyPriceValue(property);
  const currency = resolveCurrencyLabel(property.pricing?.currency);
  const suffix = property.rentalType === 'SHORT_TERM' ? '/ доба' : '/ міс';
  return { value, suffix, currency };
};

export const resolveMapPropertyMeta = (property: PropertyResponseDto | null): string => {
  if (!property) {
    return '';
  }
  const parts = [
    property.rooms ? `${property.rooms} кімн` : null,
    property.areaSqm ? `${Number(property.areaSqm)} м²` : null,
    property.floor && property.totalFloors ? `${property.floor}/${property.totalFloors} поверх` : null,
  ].filter(Boolean);
  return parts.join(' • ');
};

export const resolveMapAddressLine = (property: PropertyResponseDto | null): string => {
  if (!property) {
    return 'Оберіть оголошення на мапі';
  }
  const parts = [property.address?.street, property.address?.houseNumber].filter(Boolean);
  return parts.length > 0 ? `вул. ${parts.join(', ')}` : property.title;
};

export const resolveCompactRooms = (property: PropertyResponseDto | null): string | null => {
  if (property?.rooms) {
    return `${property.rooms}к`;
  }
  return property?.title ? resolveRoomsFromTitle(property.title) : null;
};
