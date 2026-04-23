import type { AmenityDto, PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';

type GroupedAmenities = Array<{ category: string; amenities: AmenityDto[] }>;

export const normalizePropertyPhotos = (property?: PropertyResponseDto | null, fallbackImage?: string): string[] => {
  const fallback = fallbackImage ?? '';
  if (!property?.photos?.length) {
    return fallback ? [fallback] : [];
  }

  const mapped = property.photos.map((photo) => photo.url).filter((url): url is string => Boolean(url));
  if (mapped.length > 0) {
    return mapped;
  }
  return fallback ? [fallback] : [];
};

export const groupAmenitiesByCategory = (amenities?: AmenityDto[] | null): GroupedAmenities => {
  if (!amenities?.length) {
    return [];
  }

  const amenitiesByCategory = new Map<string, AmenityDto[]>();
  for (const amenity of amenities) {
    const current = amenitiesByCategory.get(amenity.category) ?? [];
    current.push(amenity);
    amenitiesByCategory.set(amenity.category, current);
  }

  return Array.from(amenitiesByCategory.entries()).map(([category, categoryAmenities]) => ({
    category,
    amenities: categoryAmenities,
  }));
};

export const resolvePropertyAddressLine = (property?: PropertyResponseDto | null): string =>
  [property?.address?.street, property?.address?.houseNumber, property?.address?.apartment].filter(Boolean).join(', ');

export const resolvePropertyCity = (property?: PropertyResponseDto | null, fallbackCityLabel?: string): string =>
  property?.address?.city || fallbackCityLabel || '';

export const resolveOwnerPresentation = (
  owner?: PublicUserProfileDto | null,
  fallbackOwnerLabel?: string,
): { ownerName: string; ownerInitial: string } => {
  const ownerName =
    owner?.firstName || owner?.lastName
      ? [owner?.firstName, owner?.lastName].filter(Boolean).join(' ')
      : fallbackOwnerLabel || '';

  return {
    ownerName,
    ownerInitial: owner?.firstName?.charAt(0)?.toUpperCase() || 'U',
  };
};

export const resolveOwnerPhone = (owner?: PublicUserProfileDto | null): string => {
  const raw = owner as unknown as Record<string, unknown> | null | undefined;
  const candidates = [raw?.phone, raw?.phoneNumber, raw?.mobilePhone, raw?.contactPhone];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return '';
};

export const getReviewedBookingIds = (
  reviews: Array<{ authorId?: number; bookingId?: number }>,
  userId?: number,
): Set<number> => {
  if (!userId) {
    return new Set<number>();
  }

  return new Set(
    reviews
      .filter((review) => review.authorId === userId)
      .map((review) => Number(review.bookingId))
      .filter((bookingId) => Number.isFinite(bookingId) && bookingId > 0),
  );
};
