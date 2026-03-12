import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PropertyListItem } from '@/components/search/PropertyListItem';
import { ROUTES } from '@/config/routes';
import { useMyFavoritesQuery } from '@/hooks/api';
import { getApiErrorMessage } from '@/utils/errors';

const FavoritesPage = () => {
  const favoritesQuery = useMyFavoritesQuery();
  const favorites = favoritesQuery.data ?? [];
  const favoritesError = favoritesQuery.error
    ? getApiErrorMessage(favoritesQuery.error, 'Не вдалося завантажити обране.')
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Heart size={18} fill="#ef4444" color="#ef4444" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">Улюблені оголошення</h1>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{favorites.length}</span>
        </div>

        {favoritesError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{favoritesError}</p>
        ) : favoritesQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600">
            У вас ще немає обраних оголошень.
            <Link to={ROUTES.search} className="ml-1 font-semibold text-blue-700 hover:underline">
              Перейти до пошуку
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((favorite) => (
              <PropertyListItem key={favorite.id} property={favorite.property} variant="single" isFavorite />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FavoritesPage;
