import { useQueries } from '@tanstack/react-query';
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOME_POPULAR_CITIES } from '@/constants/homePageContent';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { useMyFavoritesQuery, useSearchPropertiesQuery } from '@/hooks/api';
import { propertyService } from '@/services/propertyService';
import type { RentalType } from '@/types/enums';

const HOME_POPULAR_CITY_QUERY_META = HOME_POPULAR_CITIES.flatMap((city) =>
  city.countQueries.map((cityQuery) => ({
    cityName: city.name,
    cityQuery,
  })),
);

const resolveTotalElements = (pageData: unknown): number => {
  if (!pageData || typeof pageData !== 'object') {
    return 0;
  }

  const source = pageData as Record<string, unknown>;
  const nested = source.page as Record<string, unknown> | undefined;
  const candidates = [
    source.totalElements,
    source.total_elements,
    nested?.totalElements,
    nested?.total_elements,
  ];

  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric) && numeric >= 0) {
      return numeric;
    }
  }

  return 0;
};

export const useHomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [heroRentalType, setHeroRentalType] = useState<RentalType>('SHORT_TERM');

  const shortTermQuery = useSearchPropertiesQuery(
    { rentalType: 'SHORT_TERM' },
    { page: 0, size: 9, sort: 'createdAt,desc' },
  );

  const longTermQuery = useSearchPropertiesQuery(
    { rentalType: 'LONG_TERM' },
    { page: 0, size: 9, sort: 'createdAt,desc' },
  );

  const popularCityCountQueries = useQueries({
    queries: HOME_POPULAR_CITY_QUERY_META.map(({ cityQuery }) => ({
      queryKey: ['home', 'popular-city-count', cityQuery],
      queryFn: () => propertyService.searchProperties({ city: cityQuery }, { page: 0, size: 1, sort: 'createdAt,desc' }),
    })),
  });

  const favoritesQuery = useMyFavoritesQuery(isAuthenticated);
  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data?.map((favorite) => favorite.propertyId) ?? []),
    [favoritesQuery.data],
  );

  const cityTotalCounts = useMemo(() => {
    const totals = new Map<string, number>();
    HOME_POPULAR_CITIES.forEach((city) => totals.set(city.name, 0));

    popularCityCountQueries.forEach((cityQuery, index) => {
      const cityName = HOME_POPULAR_CITY_QUERY_META[index].cityName;
      const totalElements = resolveTotalElements(cityQuery.data);
      const prev = totals.get(cityName) ?? 0;
      totals.set(cityName, Math.max(prev, totalElements));
    });

    return totals;
  }, [popularCityCountQueries]);

  const popularCities = useMemo(
    () =>
      HOME_POPULAR_CITIES.map((city) => ({
        ...city,
        listingsCount: cityTotalCounts.get(city.name) ?? 0,
      })),
    [cityTotalCounts],
  );

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const city = query.trim();
    const searchParams = new URLSearchParams();

    searchParams.set('rentalType', heroRentalType);

    if (city) {
      searchParams.set('city', city);
    }

    navigate(`${ROUTES.search}?${searchParams.toString()}`);
  };

  return {
    query,
    setQuery,
    heroRentalType,
    setHeroRentalType,
    shortTerm: shortTermQuery.data?.content ?? [],
    longTerm: longTermQuery.data?.content ?? [],
    popularCities,
    favoriteIds,
    loadingShort: shortTermQuery.isLoading || shortTermQuery.isFetching,
    loadingLong: longTermQuery.isLoading || longTermQuery.isFetching,
    handleSearchSubmit,
  };
};
