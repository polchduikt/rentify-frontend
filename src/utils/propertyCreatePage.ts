import type { PropertyPhotoDto } from '@/types/property';
import type { AvailabilityDraft, PropertyCreateFormValues } from '@/types/propertyCreate';

export const STEP_FIELDS: Array<Array<keyof PropertyCreateFormValues>> = [
  ['rentalType', 'propertyType', 'title', 'description'],
  ['cityQuery', 'country', 'city', 'street', 'lat', 'lng'],
  ['rooms', 'floor', 'totalFloors', 'areaSqm', 'maxGuests', 'checkInTime', 'checkOutTime'],
  [],
  ['pricePerNight', 'pricePerMonth', 'currency'],
];

export const hasText = (value: string, minLength = 1) => value.trim().length >= minLength;

export const toNumber = (value: string): number | undefined => {
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const createEmptyAvailabilityDraft = (): AvailabilityDraft => ({
  dateFrom: '',
  dateTo: '',
  reason: '',
});

export const areIdsEqual = (left: number[], right: number[]) =>
  left.length === right.length && left.every((id, index) => id === right[index]);

export const isNotFoundError = (error: unknown) => {
  const value = error as { response?: { status?: number } };
  return value?.response?.status === 404;
};

export const toFileFromUrl = async (url: string, fileNameBase: string): Promise<File> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const blob = await response.blob();
  const mimeType = blob.type || 'image/jpeg';
  const ext = mimeType.split('/')[1] || 'jpg';
  return new File([blob], `${fileNameBase}.${ext}`, { type: mimeType });
};

export const getAvailabilityBlocksForRequest = (availabilityBlocks: AvailabilityDraft[]) =>
  availabilityBlocks.map((block) => ({
    dateFrom: block.dateFrom,
    dateTo: block.dateTo,
    reason: block.reason || undefined,
  }));

export const getSortedPhotoIds = (photos: PropertyPhotoDto[]) => photos.map((photo) => photo.id);
