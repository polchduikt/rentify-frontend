import { Link } from 'react-router-dom';
import { PropertyListItem } from '@/components/search/PropertyListItem';
import { ROUTES } from '@/config/routes';
import type { FavoritesSectionProps } from './FavoritesSection.types';


export const FavoritesSection = ({
  favorites,
  favoritesCount,
  favoritesLoading,
  favoritesError,
}: FavoritesSectionProps) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-xl font-bold text-slate-900">Обране</h2>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{favoritesCount}</span>
    </div>
    {favoritesError ? (
      <p className="text-sm text-rose-700">{favoritesError}</p>
    ) : favoritesLoading ? (
      <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
    ) : favorites.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
        Ще немає обраних оголошень.
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
);
