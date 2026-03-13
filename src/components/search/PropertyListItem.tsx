import { useState } from 'react';
import { BedDouble, Heart, Layers, MapPin, Square } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEARCH_PROPERTY_FALLBACK_IMAGE } from '@/constants/propertyImages';
import { SEARCH_PROPERTY_TYPE_LABELS } from '@/constants/searchUi';
import { ROUTES } from '@/config/routes';
import type { PropertyResponseDto } from '@/types/property';
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '@/hooks/api/useFavoriteApi';
import { isTopPromotionActive } from '@/utils/promotions';
import type { PropertyListItemProps } from './PropertyListItem.types';

const resolveMeta = (property: PropertyResponseDto): string[] => {
  const parts: string[] = [];

  if (property.rooms != null) {
    parts.push(`${property.rooms} кімнати`);
  }
  if (property.areaSqm != null) {
    parts.push(`${Number(property.areaSqm)} РјВІ`);
  }
  if (property.floor != null) {
    parts.push(property.totalFloors != null ? `${property.floor} поверх з ${property.totalFloors}` : `${property.floor} поверх`);
  }

  return parts;
};

const resolveAddress = (property: PropertyResponseDto): { city: string; street: string } => {
  const city = property.address?.location?.city || property.address?.location?.region || '';
  const street = [property.address?.street, property.address?.houseNumber].filter(Boolean).join(', ');
  return { city, street };
};

const resolvePropertyPrice = (property: PropertyResponseDto): { value: number; suffix: string } => {
  const hasNightlyPrice = (property.pricing?.pricePerNight ?? 0) > 0;
  const hasMonthlyPrice = (property.pricing?.pricePerMonth ?? 0) > 0;
  const isShort = property.rentalType === 'SHORT_TERM' || (!property.rentalType && hasNightlyPrice && !hasMonthlyPrice);

  return {
    value: Number(isShort ? property.pricing?.pricePerNight : property.pricing?.pricePerMonth) || 0,
    suffix: isShort ? '/ доба' : '/ міс',
  };
};

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

export const PropertyListItem = ({ property, variant = 'single', isFavorite = false }: PropertyListItemProps) => {
  const [isLocalFavorite, setIsLocalFavorite] = useState(isFavorite);
  const addToFavoritesMutation = useAddToFavoritesMutation();
  const removeFromFavoritesMutation = useRemoveFromFavoritesMutation();

  const imageUrl = property.photos?.[0]?.url ?? SEARCH_PROPERTY_FALLBACK_IMAGE;
  const { value: priceValue, suffix } = resolvePropertyPrice(property);
  const currency = property.pricing?.currency || 'UAH';
  const { city, street } = resolveAddress(property);
  const meta = resolveMeta(property);
  const propertyTypeLabel = SEARCH_PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType || 'Нерухомість';
  const isDouble = variant === 'double';
  const isRecommended = isTopPromotionActive(property);
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
    <article className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
      <Link
        to={ROUTES.propertyDetails(property.id)}
        aria-label={`Переглянути оголошення: ${property.title}`}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div
          className={
            isDouble
              ? 'grid h-full grid-cols-1 md:grid-cols-[minmax(0,1.18fr)_minmax(0,1fr)]'
              : 'grid h-full grid-cols-1 md:grid-cols-[minmax(0,460px)_1fr]'
          }
        >
          <div className={`relative overflow-hidden bg-slate-100 ${isDouble ? 'h-[220px] md:h-[220px]' : 'h-[220px] md:h-[320px]'}`}>
            <img src={imageUrl} alt={property.title} className="h-full w-full object-cover" />
            {isRecommended ? (
              <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                Рекомендовано
              </span>
            ) : null}
          </div>

          <div className={isDouble ? 'min-w-0 p-3 lg:p-3.5' : 'min-w-0 p-5 lg:p-6'}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-baseline gap-2">
                <p className={`leading-none font-extrabold text-gray-900 ${isDouble ? 'text-[24px] lg:text-[26px]' : 'text-[34px]'}`}>
                  {priceValue > 0 ? priceValue.toLocaleString('uk-UA') : '0'} {currency}
                </p>
                <p className={`text-gray-500 ${isDouble ? 'text-[14px]' : 'text-[18px]'}`}>{suffix}</p>
              </div>
              <button
                type="button"
                onClick={handleFavoriteClick}
                disabled={isLoading}
                className="inline-flex shrink-0 items-center justify-center rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label={isLocalFavorite ? 'Видалити з улюблених' : 'Додати в улюблене'}
              >
                <Heart
                  size={isDouble ? 21 : 24}
                  fill={isLocalFavorite ? '#ef4444' : 'none'}
                  color={isLocalFavorite ? '#ef4444' : '#94a3b8'}
                />
              </button>
            </div>

            <h3 className={`leading-tight font-bold text-gray-900 break-words [overflow-wrap:anywhere] ${isDouble ? 'mt-2 text-[20px]' : 'mt-3.5 text-[28px]'}`}>
              {street ? `вул. ${street}` : property.title}
            </h3>

            <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-600 ${isDouble ? 'mt-1 text-[13px]' : 'mt-2 text-[17px]'}`}>
              <span className="flex items-center gap-1.5">
                <MapPin size={15} /> {city || 'Місто не вказано'}
              </span>
              <span className="text-gray-300">•</span>
              <span>{propertyTypeLabel}</span>
              {property.rentalType ? (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{property.rentalType === 'SHORT_TERM' ? 'Подобова оренда' : 'Довгострокова оренда'}</span>
                </>
              ) : null}
            </div>

            {meta.length > 0 ? (
              <div className={`mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-800 ${isDouble ? 'text-[13px]' : 'text-[16px]'}`}>
                {meta.map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    {item.includes('кімнати') ? <BedDouble size={16} className="text-gray-500" /> : null}
                    {item.includes('РјВІ') ? <Square size={16} className="text-gray-500" /> : null}
                    {item.includes('поверх') ? <Layers size={16} className="text-gray-500" /> : null}
                    {item}
                  </span>
                ))}
              </div>
            ) : null}

            {property.description ? (
              <p className={`mt-4 line-clamp-2 whitespace-pre-line break-words [overflow-wrap:anywhere] text-gray-700 ${isDouble ? 'text-[13px]' : 'text-[15px]'}`}>
                {property.description.length > 180 ? `${property.description.slice(0, 180)}...` : property.description}
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className={`text-gray-500 ${isDouble ? 'text-[12px]' : 'text-[14px]'}`}>{formatPublishedLabel(property.createdAt)}</div>
              <span className="inline-flex items-center rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                Детальніше
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};
