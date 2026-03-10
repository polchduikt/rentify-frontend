import { BedDouble, Expand, Layers, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PropertyResponseDto } from '@/types/property';

const FALLBACK_PHOTO_URL =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';

interface PropertyCardProps {
  property: PropertyResponseDto;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const imageUrl = property.photos?.[0]?.url || FALLBACK_PHOTO_URL;
  const city = property.address?.location?.city || property.address?.location?.region || 'Місто не вказано';
  const street = [property.address?.street, property.address?.houseNumber].filter(Boolean).join(', ');

  const basePrice =
    property.rentalType === 'SHORT_TERM'
      ? property.pricing?.pricePerNight || property.pricing?.pricePerMonth
      : property.pricing?.pricePerMonth || property.pricing?.pricePerNight;
  const priceSuffix = property.rentalType === 'SHORT_TERM' ? '/ніч' : '/місяць';
  const currency = property.pricing?.currency || 'UAH';

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="aspect-[3/2] overflow-hidden bg-slate-100">
        <img src={imageUrl} alt={property.title} className="h-full w-full object-cover transition group-hover:scale-105" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900">
            {Number(basePrice || 0).toLocaleString('uk-UA')} {currency}
          </span>
          <span className="text-sm font-medium text-slate-500">{priceSuffix}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-900">{property.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin size={14} />
          <span>{street || city}</span>
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
              {property.floor} / {property.totalFloors || '?'}
            </span>
          )}
        </div>

        <Link
          to={`/properties/${property.id}`}
          className="mt-5 inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Детальніше
        </Link>
      </div>
    </article>
  );
};

export default PropertyCard;
