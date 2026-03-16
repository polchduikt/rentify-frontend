import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { LocationSuggestionDto } from '@/types/location';
import api from './api';
import { cleanQueryParams } from './queryParams';

export interface LocationSuggestQuery {
  q: string;
  cityId?: number;
  types?: string[];
  limit?: number;
}

export const locationService = {
  async suggest(query: LocationSuggestQuery): Promise<LocationSuggestionDto[]> {
    const { data } = await api.get<LocationSuggestionDto[]>(API_ENDPOINTS.locations.suggest, {
      params: cleanQueryParams({
        q: query.q,
        cityId: query.cityId,
        types: query.types,
        limit: query.limit,
      }),
    });
    return data;
  },
};
