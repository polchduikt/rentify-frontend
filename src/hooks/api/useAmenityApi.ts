import { useQuery } from '@tanstack/react-query';
import { amenityService } from '@/services/amenityService';
import type { AmenityCategory } from '@/types/enums';
import { queryKeys } from '@/api/queryKeys';

export const useAmenitiesQuery = (category?: AmenityCategory) =>
  useQuery({
    queryKey: queryKeys.amenities.all(category),
    queryFn: () => amenityService.getAmenities(category),
  });

export const useAmenitiesGroupedQuery = () =>
  useQuery({
    queryKey: queryKeys.amenities.grouped(),
    queryFn: () => amenityService.getAmenitiesGrouped(),
  });
