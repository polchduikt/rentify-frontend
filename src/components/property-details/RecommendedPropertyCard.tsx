import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import type { PropertyResponseDto } from '@/types/property';
import { FALLBACK_IMAGE } from './constants';
import { formatPrice } from './utils';

interface RecommendedPropertyCardProps {
  property: PropertyResponseDto;
}

export const RecommendedPropertyCard = ({ property }: RecommendedPropertyCardProps) => {
  const image = property.photos?.[0]?.url || FALLBACK_IMAGE;
  const price = Number(property.pricing?.pricePerMonth || property.pricing?.pricePerNight || 0);
  const currency = property.pricing?.currency || 'UAH';
  const city = property.address?.location?.city || 'Місто не вказано';
  const street = [property.address?.street, property.address?.houseNumber].filter(Boolean).join(', ');

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <img src={image} alt={property.title} className="h-44 w-full object-cover" />
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
