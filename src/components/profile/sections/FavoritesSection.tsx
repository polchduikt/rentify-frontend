import { Link } from 'react-router-dom';
import { FALLBACK_IMAGE } from '@/components/property-details/constants';
import { ROUTES } from '@/config/routes';
import type { FavoriteResponseDto } from '@/types/favorite';

interface FavoritesSectionProps {
  favorites: FavoriteResponseDto[];
  favoritesCount: number;
  favoritesLoading: boolean;
  favoritesError: string | null;
}

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
      <div className="space-y-3">
        {favorites.slice(0, 5).map((favorite) => (
          <article key={favorite.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
            <img
              src={favorite.property.photos?.[0]?.url || FALLBACK_IMAGE}
              alt={favorite.property.title}
              className="h-16 w-20 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-bold text-slate-900">{favorite.property.title}</p>
              <p className="text-xs text-slate-500">{favorite.property.address?.location?.city || 'Місто не вказано'}</p>
            </div>
            <Link
              to={ROUTES.propertyDetails(favorite.propertyId)}
              className="inline-flex items-center rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Деталі
            </Link>
          </article>
        ))}
      </div>
    )}
  </section>
);
