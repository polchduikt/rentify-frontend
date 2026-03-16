import { useQuery } from '@tanstack/react-query';
import { locationService, type LocationSuggestQuery } from '@/services/locationService';
import { queryKeys } from '@/api/queryKeys';

const SUGGEST_STALE_TIME_MS = 2 * 60_000;
const SUGGEST_GC_TIME_MS = 5 * 60_000;

export const useLocationSuggestQuery = (query: LocationSuggestQuery, enabled = true) =>
  useQuery({
    queryKey: queryKeys.locations.suggest(query),
    queryFn: () => locationService.suggest(query),
    enabled: enabled && query.q.trim().length >= 2,
    staleTime: SUGGEST_STALE_TIME_MS,
    gcTime: SUGGEST_GC_TIME_MS,
  });
