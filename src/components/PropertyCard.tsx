import { useEffect, useState } from 'react';
import { BedDouble, Expand, Heart, Layers, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PROPERTY_CARD_FALLBACK_IMAGE } from '@/constants/propertyImages';
import { ROUTES } from '@/config/routes';
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '@/hooks/api/useFavoriteApi';
import { isTopPromotionActive } from '@/utils/promotions';
import type { PropertyCardProps } from './PropertyCard.types';

const formatPublishedLabel = (createdAt?: string): string => {
  if (!createdAt) return 'Опубліковано нещодавно';

  const ms = Date.now() - new Date(createdAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 'Опубліковано нещодавно';

  const minutes = Math.floor(ms / (1000 * 60));
  if (minutes < 60) return `Опубліковано ${Math.max(1, minutes)} хв тому`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Опубліковано ${hours} год тому`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `Опубліковано ${days} дн тому`;

  const months = Math.floor(days / 30);
  return `Опубліковано ${months} міс тому`;
};


const PropertyCard = ({ property, isFavorite = false }: PropertyCardProps) => {
  const [isLocalFavorite, setIsLocalFavorite] = useState(isFavorite);
  const addToFavoritesMutation = useAddToFavoritesMutation();
  const removeFromFavoritesMutation = useRemoveFromFavoritesMutation();

  useEffect(() => {
    setIsLocalFavorite(isFavorite);
  }, [isFavorite]);

  const imageUrl = property.photos?.[0]?.url || PROPERTY_CARD_FALLBACK_IMAGE;
  const isRecommended = isTopPromotionActive(property);
  const city = property.address?.location?.city || property.address?.location?.region || 'Місто не вказано';
  const street = [property.address?.street, property.address?.houseNumber].filter(Boolean).join(', ');

  const basePrice =
    property.rentalType === 'SHORT_TERM'
      ? property.pricing?.pricePerNight || property.pricing?.pricePerMonth
      : property.pricing?.pricePerMonth || property.pricing?.pricePerNight;
  const priceSuffix = property.rentalType === 'SHORT_TERM' ? '/ніч' : '/місяць';
  const currency = property.pricing?.currency || 'UAH';

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
    <article className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        to={ROUTES.propertyDetails(property.id)}
        aria-label={`Переглянути оголошення: ${property.title}`}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="relative aspect-[3/2] overflow-hidden bg-slate-100">
          <img src={imageUrl} alt={property.title} className="h-full w-full object-cover transition group-hover:scale-105" />
          {isRecommended ? (
            <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              Рекомендовано
            </span>
          ) : null}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 inline-flex items-center justify-center rounded-lg bg-white/80 p-2 transition hover:bg-white"
            aria-label={isLocalFavorite ? 'Видалити з улюблених' : 'Додати в улюблене'}
          >
            <Heart
              size={20}
              fill={isLocalFavorite ? '#ef4444' : 'none'}
              color={isLocalFavorite ? '#ef4444' : '#64748b'}
            />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="mb-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">
              {Number(basePrice || 0).toLocaleString('uk-UA')} {currency}
            </span>
            <span className="text-sm font-medium text-slate-500">{priceSuffix}</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 break-words [overflow-wrap:anywhere]">{property.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin size={14} />
            <span className="break-words [overflow-wrap:anywhere]">{street || city}</span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            {property.rooms != null && (
              <span className="inline-flex items-center gap-1.5">
                <BedDouble size={15} className="text-slate-400" />
                {property.rooms} кімн.
              </span>
            )}
            {property.areaSqm != null && (
              <span className="inline-flex items-center gap-1.5">
                <Expand size={14} className="text-slate-400" />
                {Number(property.areaSqm)} м²
              </span>
            )}
            {property.floor != null && (
              <span className="inline-flex items-center gap-1.5">
                <Layers size={14} className="text-slate-400" />
                {property.totalFloors != null ? `${property.floor} поверх з ${property.totalFloors}` : `${property.floor} поверх`}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm text-slate-500">{formatPublishedLabel(property.createdAt)}</p>
        </div>
      </Link>
    </article>
  );
};

export default PropertyCard;
