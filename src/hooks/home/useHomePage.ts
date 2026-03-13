import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMyFavoritesQuery, useSearchPropertiesQuery } from '@/hooks/api';
import { HOME_POPULAR_CITIES } from '@/constants/homePageContent';
import { ROUTES } from '@/config/routes';
import type { RentalType } from '@/types/enums';

export const useHomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [heroRentalType, setHeroRentalType] = useState<RentalType>('SHORT_TERM');

  const shortTermQuery = useSearchPropertiesQuery(
    { rentalType: 'SHORT_TERM' },
    { page: 0, size: 9, sort: 'createdAt,desc' }
  );

  const longTermQuery = useSearchPropertiesQuery(
    { rentalType: 'LONG_TERM' },
    { page: 0, size: 9, sort: 'createdAt,desc' }
  );

  const kyivCountQuery = useSearchPropertiesQuery({ city: 'Київ' }, { page: 0, size: 1, sort: 'createdAt,desc' });
  const lvivCountQuery = useSearchPropertiesQuery({ city: 'Львів' }, { page: 0, size: 1, sort: 'createdAt,desc' });
  const odesaCountQuery = useSearchPropertiesQuery({ city: 'Одеса' }, { page: 0, size: 1, sort: 'createdAt,desc' });
  const kharkivCountQuery = useSearchPropertiesQuery({ city: 'Харків' }, { page: 0, size: 1, sort: 'createdAt,desc' });

  const favoritesQuery = useMyFavoritesQuery(isAuthenticated);
  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data?.map((favorite) => favorite.propertyId) ?? []),
    [favoritesQuery.data]
  );

  const allLoadedProperties = useMemo(
    () => [...(shortTermQuery.data?.content ?? []), ...(longTermQuery.data?.content ?? [])],
    [longTermQuery.data?.content, shortTermQuery.data?.content]
  );

  const loadedCityCounts = useMemo(() => {
    const aliasesByCity: Record<string, string[]> = {
      Київ: ['київ', 'kyiv'],
      Львів: ['львів', 'lviv'],
      Одеса: ['одеса', 'odesa', 'odessa'],
      Харків: ['харків', 'kharkiv'],
    };

    return allLoadedProperties.reduce<Record<string, number>>((acc, property) => {
      const normalizedCity = property.address.location.city.trim().toLowerCase();
      const matchedCityName =
        Object.entries(aliasesByCity).find(([, aliases]) => aliases.some((alias) => normalizedCity.includes(alias)))?.[0] ??
        null;
      if (!matchedCityName) {
        return acc;
      }
      acc[matchedCityName] = (acc[matchedCityName] ?? 0) + 1;
      return acc;
    }, {});
  }, [allLoadedProperties]);

  const cityTotalCounts = useMemo(
    () =>
      new Map<string, number>([
        ['Київ', kyivCountQuery.data?.totalElements ?? 0],
        ['Львів', lvivCountQuery.data?.totalElements ?? 0],
        ['Одеса', odesaCountQuery.data?.totalElements ?? 0],
        ['Харків', kharkivCountQuery.data?.totalElements ?? 0],
      ]),
    [
      kharkivCountQuery.data?.totalElements,
      kyivCountQuery.data?.totalElements,
      lvivCountQuery.data?.totalElements,
      odesaCountQuery.data?.totalElements,
    ]
  );

  const popularCities = useMemo(
    () =>
      HOME_POPULAR_CITIES.map((city) => {
        const totalFromCityQuery = cityTotalCounts.get(city.name) ?? 0;
        const fallbackFromLoaded = loadedCityCounts[city.name] ?? 0;
        return {
          ...city,
          listingsCount: totalFromCityQuery > 0 ? totalFromCityQuery : fallbackFromLoaded,
        };
      }),
    [cityTotalCounts, loadedCityCounts]
  );

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
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
