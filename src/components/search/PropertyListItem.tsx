import { BedDouble, Heart, Layers, MapPin, Square } from 'lucide-react';
import type { PropertyResponseDto } from '@/types/property';

const FALLBACK_PHOTO_URL =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Квартира',
  HOUSE: 'Будинок',
  ROOM: 'Кімната',
  STUDIO: 'Студія',
};

interface PropertyListItemProps {
  property: PropertyResponseDto;
  variant?: 'single' | 'double';
}

const resolveMeta = (property: PropertyResponseDto): string[] => {
  const parts: string[] = [];

  if (property.rooms != null) {
    parts.push(`${property.rooms} кімнати`);
  }
  if (property.areaSqm != null) {
    parts.push(`${Number(property.areaSqm)} м²`);
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
  if (!createdAt) {
    return 'Опубліковано нещодавно';
  }

  const ms = Date.now() - new Date(createdAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) {
    return 'Опубліковано нещодавно';
  }

  const minutes = Math.floor(ms / (1000 * 60));
  if (minutes < 60) {
    return `Опубліковано ${Math.max(1, minutes)} хв тому`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Опубліковано ${hours} год тому`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `Опубліковано ${days} дн тому`;
  }

  const months = Math.floor(days / 30);
  return `Опубліковано ${months} міс тому`;
};

export const PropertyListItem = ({ property, variant = 'single' }: PropertyListItemProps) => {
  const imageUrl = property.photos?.[0]?.url ?? FALLBACK_PHOTO_URL;
  const { value: priceValue, suffix } = resolvePropertyPrice(property);
  const currency = property.pricing?.currency || 'UAH';
  const { city, street } = resolveAddress(property);
  const meta = resolveMeta(property);
  const propertyTypeLabel = PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType || 'Нерухомість';
  const isDouble = variant === 'double';

  return (
    <article className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
      <div className={isDouble ? 'grid h-full grid-cols-1 md:grid-cols-[minmax(0,1.18fr)_minmax(0,1fr)]' : 'grid h-full grid-cols-1 md:grid-cols-[minmax(0,460px)_1fr]'}>
        <div className="h-full">
          <img
            src={imageUrl}
            alt={property.title}
            className={`h-full w-full object-cover aspect-[4/3] md:aspect-auto ${isDouble ? 'md:min-h-[220px]' : 'md:min-h-[320px]'}`}
          />
        </div>

        <div className={isDouble ? 'p-3 lg:p-3.5' : 'p-5 lg:p-6'}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <p className={`leading-none font-extrabold text-gray-900 ${isDouble ? 'text-[24px] lg:text-[26px]' : 'text-[34px]'}`}>
                  {priceValue > 0 ? priceValue.toLocaleString('uk-UA') : '0'} {currency}
                </p>
                <p className={`text-gray-500 ${isDouble ? 'text-[14px]' : 'text-[18px]'}`}>{suffix}</p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 text-gray-400 transition-colors hover:text-red-500"
              aria-label="Додати в обране"
            >
              <Heart size={isDouble ? 21 : 24} />
            </button>
          </div>

          <h3 className={`leading-tight font-bold text-gray-900 ${isDouble ? 'mt-2 text-[20px]' : 'mt-3.5 text-[28px]'}`}>
            {street ? `вул. ${street}` : property.title}
          </h3>

          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-600 ${isDouble ? 'mt-1 text-[13px]' : 'mt-2 text-[17px]'}`}>
            <span className="flex items-center gap-1.5">
              <MapPin size={15} /> {city || 'Місто не вказано'}
            </span>
            <span className="text-gray-300">•</span>
            <span>{propertyTypeLabel}</span>
            {property.rentalType && (
              <>
                <span className="text-gray-300">•</span>
                <span>{property.rentalType === 'SHORT_TERM' ? 'Подобова оренда' : 'Довгострокова оренда'}</span>
              </>
            )}
          </div>

          {meta.length > 0 && (
            <div className={`mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-800 ${isDouble ? 'text-[13px]' : 'text-[16px]'}`}>
              {meta.map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  {item.includes('кімнати') && <BedDouble size={16} className="text-gray-500" />}
                  {item.includes('м²') && <Square size={16} className="text-gray-500" />}
                  {item.includes('поверх') && <Layers size={16} className="text-gray-500" />}
                  {item}
                </span>
              ))}
            </div>
          )}

          {property.description && (
            <p className={`mt-4 text-gray-700 ${isDouble ? 'text-[13px]' : 'text-[15px]'}`}>
              {property.description.length > 180 ? `${property.description.slice(0, 180)}...` : property.description}
            </p>
          )}

          <div className={`mt-4 text-gray-500 ${isDouble ? 'text-[12px]' : 'text-[14px]'}`}>{formatPublishedLabel(property.createdAt)}</div>
        </div>
      </div>
    </article>
  );
};
