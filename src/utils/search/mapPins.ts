import type { PropertyMapPinDto, PropertyResponseDto } from '@/types/property';
import { resolvePropertyPriceValue } from './searchPageUtils';

const toFiniteNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const toFallbackMapPin = (property: PropertyResponseDto): PropertyMapPinDto | null => {
  const lat = toFiniteNumber(property.address?.lat);
  const lng = toFiniteNumber(property.address?.lng);
  if (lat == null || lng == null) {
    return null;
  }

  return {
    id: property.id,
    title: property.title,
    propertyType: property.propertyType,
    marketType: property.marketType,
    rentalType: property.rentalType,
    rooms: property.rooms,
    lat,
    lng,
    price: resolvePropertyPriceValue(property),
    currency: property.pricing?.currency || 'UAH',
    isTopPromoted: property.isTopPromoted,
    averageRating: property.averageRating,
    reviewCount: property.reviewCount,
  };
};

export const buildFallbackMapPins = (properties: PropertyResponseDto[]): PropertyMapPinDto[] =>
  properties
    .map((property) => toFallbackMapPin(property))
    .filter((pin): pin is PropertyMapPinDto => pin != null);

export const enrichMapPinsWithRooms = (pins: PropertyMapPinDto[], properties: PropertyResponseDto[]): PropertyMapPinDto[] => {
  const roomsByPropertyId = new Map(properties.map((property) => [property.id, property.rooms] as const));
  return pins.map((pin) => ({
    ...pin,
    rooms: pin.rooms ?? roomsByPropertyId.get(pin.id),
  }));
};
