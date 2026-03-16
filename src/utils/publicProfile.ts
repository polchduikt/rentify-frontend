import type { PropertyResponseDto } from '@/types/property';

export const formatPublicProfilePropertyPrice = (property: PropertyResponseDto) => {
  const price = Number(property.pricing?.pricePerMonth || property.pricing?.pricePerNight || 0);
  const currency = property.pricing?.currency || 'UAH';
  return `${price.toLocaleString('uk-UA')} ${currency}`;
};

export const formatPublicProfilePropertyAddress = (property: PropertyResponseDto) => {
  const city = property.address?.location?.city || property.address?.location?.region || 'Місто не вказано';
  const street = [property.address?.street, property.address?.houseNumber].filter(Boolean).join(', ');
  return street || city;
};
