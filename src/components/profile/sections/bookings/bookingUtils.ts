import type { PropertyResponseDto } from '@/types/property';

const toFiniteNumber = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export const buildPropertyAddress = (property?: PropertyResponseDto): { primary: string; secondary: string; fullText: string } => {
  const location = property?.address?.location;
  const primary = [location?.city, location?.region].filter(Boolean).join(', ') || 'Локацію не вказано';

  const details: string[] = [];
  if (property?.address?.street) details.push(`вул. ${property.address.street}`);
  if (property?.address?.houseNumber) details.push(`буд. ${property.address.houseNumber}`);
  if (property?.address?.apartment) details.push(`кв. ${property.address.apartment}`);
  if (property?.address?.districtName) details.push(`район: ${property.address.districtName}`);
  if (property?.address?.metroStationName) details.push(`метро: ${property.address.metroStationName}`);
  if (property?.address?.residentialComplexName) details.push(`ЖК: ${property.address.residentialComplexName}`);

  const secondary = details.join(' • ') || 'Без детальної адреси';
  const fullText = [primary, details.length > 0 ? secondary : null].filter(Boolean).join(', ');
  return { primary, secondary, fullText };
};

export const getPropertyMapUrl = (property?: PropertyResponseDto): string | null => {
  const lat = toFiniteNumber(property?.address?.lat);
  const lng = toFiniteNumber(property?.address?.lng);
  if (lat != null && lng != null) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  const fallbackAddress = buildPropertyAddress(property).fullText;
  return fallbackAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}` : null;
};

export const hasExactCoordinates = (property?: PropertyResponseDto): boolean =>
  toFiniteNumber(property?.address?.lat) != null && toFiniteNumber(property?.address?.lng) != null;

export const resolveParticipantName = (firstName?: string, lastName?: string) => {
  const full = [firstName, lastName].filter(Boolean).join(' ').trim();
  return full || 'Користувач';
};

export const resolveParticipantInitial = (firstName?: string, lastName?: string) => {
  const initial = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.toUpperCase();
  return initial || firstName?.charAt(0)?.toUpperCase() || 'U';
};
