import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { AmenityCategory } from '@/types/enums';
import type { AmenityCategoryGroupDto, AmenityDto } from '@/types/property';
import api from './api';
import { cleanQueryParams } from './queryParams';

export const amenityService = {
  async getAmenities(category?: AmenityCategory): Promise<AmenityDto[]> {
    const { data } = await api.get<AmenityDto[]>(API_ENDPOINTS.amenities.root, {
      params: cleanQueryParams({ category }),
    });
    return data;
  },

  async getAmenitiesGrouped(): Promise<AmenityCategoryGroupDto[]> {
    const { data } = await api.get<AmenityCategoryGroupDto[]>(API_ENDPOINTS.amenities.grouped);
    return data;
  },
};
