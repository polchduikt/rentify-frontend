import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMyFavoritesQuery, useSearchPropertiesQuery } from '@/hooks/api';
import { ROUTES } from '@/config/routes';

export const useHomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');

  const shortTermQuery = useSearchPropertiesQuery(
    { rentalType: 'SHORT_TERM' },
    { page: 0, size: 9, sort: 'createdAt,desc' }
  );

  const longTermQuery = useSearchPropertiesQuery(
    { rentalType: 'LONG_TERM' },
    { page: 0, size: 9, sort: 'createdAt,desc' }
  );
  const favoritesQuery = useMyFavoritesQuery(isAuthenticated);
  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data?.map((favorite) => favorite.propertyId) ?? []),
    [favoritesQuery.data]
  );

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const city = query.trim();

    if (!city) {
      navigate(ROUTES.search);
      return;
    }

    navigate(`${ROUTES.search}?city=${encodeURIComponent(city)}`);
  };

  return {
    query,
    setQuery,
    shortTerm: shortTermQuery.data?.content ?? [],
    longTerm: longTermQuery.data?.content ?? [],
    favoriteIds,
    loadingShort: shortTermQuery.isLoading || shortTermQuery.isFetching,
    loadingLong: longTermQuery.isLoading || longTermQuery.isFetching,
    handleSearchSubmit,
  };
};
