import { useQuery } from '@tanstack/react-query';
import { amenityService } from '@/services/amenityService';
import type { AmenityCategory } from '@/types/enums';
import { queryKeys } from '@/api/queryKeys';

const STATIC_STALE_TIME_MS = 15 * 60_000;
const STATIC_GC_TIME_MS = 60 * 60_000;

export const useAmenitiesQuery = (category?: AmenityCategory) =>
  useQuery({
    queryKey: queryKeys.amenities.all(category),
    queryFn: () => amenityService.getAmenities(category),
    staleTime: STATIC_STALE_TIME_MS,
    gcTime: STATIC_GC_TIME_MS,
  });

export const useAmenitiesGroupedQuery = () =>
  useQuery({
    queryKey: queryKeys.amenities.grouped(),
    queryFn: () => amenityService.getAmenitiesGrouped(),
    staleTime: STATIC_STALE_TIME_MS,
    gcTime: STATIC_GC_TIME_MS,
  });
