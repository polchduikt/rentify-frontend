import { useQuery } from '@tanstack/react-query';
import { locationService, type LocationSuggestQuery } from '@/services/locationService';
import { queryKeys } from './queryKeys';

export const useLocationSuggestQuery = (query: LocationSuggestQuery, enabled = true) =>
  useQuery({
    queryKey: queryKeys.locations.suggest(query),
    queryFn: () => locationService.suggest(query),
    enabled: enabled && query.q.trim().length >= 2,
  });
