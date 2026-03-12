import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import type { PropertyResponseDto } from '@/types/property';
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '@/hooks/api/useFavoriteApi';
import { isTopPromotionActive } from '@/utils/promotions';
import { FALLBACK_IMAGE } from './constants';
import { formatPrice } from './utils';

interface RecommendedPropertyCardProps {
  property: PropertyResponseDto;
  isFavorite?: boolean;
}

export const RecommendedPropertyCard = ({ property, isFavorite = false }: RecommendedPropertyCardProps) => {
  const [isLocalFavorite, setIsLocalFavorite] = useState(isFavorite);
  const addToFavoritesMutation = useAddToFavoritesMutation();
  const removeFromFavoritesMutation = useRemoveFromFavoritesMutation();

  const image = property.photos?.[0]?.url || FALLBACK_IMAGE;
  const isRecommended = isTopPromotionActive(property);
  const price = Number(property.pricing?.pricePerMonth || property.pricing?.pricePerNight || 0);
  const currency = property.pricing?.currency || 'UAH';
  const city = property.address?.location?.city || 'Місто не вказано';
  const street = [property.address?.street, property.address?.houseNumber].filter(Boolean).join(', ');

  const isLoading = addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    try {
      if (isLocalFavorite) {
        await removeFromFavoritesMutation.mutateAsync(property.id);
      } else {
        await addToFavoritesMutation.mutateAsync(property.id);
      }
      setIsLocalFavorite(!isLocalFavorite);
    } catch {
      // Error handling is done by React Query
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative">
        <img src={image} alt={property.title} className="h-44 w-full object-cover" />
        {isRecommended ? (
          <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">
            Рекомендовано
          </span>
        ) : null}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 inline-flex items-center justify-center rounded-lg bg-white/80 p-1.5 transition hover:bg-white"
          aria-label={isLocalFavorite ? 'Видалити з улюблених' : 'Додати в улюблене'}
        >
          <Heart
            size={16}
            fill={isLocalFavorite ? '#ef4444' : 'none'}
            color={isLocalFavorite ? '#ef4444' : '#64748b'}
          />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xl font-black text-slate-900">{formatPrice(price, currency)}</p>
        <p className="mt-1 text-sm text-slate-600">
          {city}
          {street ? <span className="text-slate-400"> • {street}</span> : null}
        </p>
        <h3 className="mt-2 line-clamp-2 text-base font-bold text-slate-900">{property.title}</h3>
        <Link
          to={ROUTES.propertyDetails(property.id)}
          className="mt-3 inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Переглянути
        </Link>
      </div>
    </article>
  );
};
