import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FALLBACK_IMAGE } from '@/components/property-details/constants';
import { ROUTES } from '@/config/routes';
import type { PropertyResponseDto } from '@/types/property';
import { PROPERTY_STATUS_LABELS } from './constants';
import { formatMoney } from './formatters';

interface PropertyPreviewItemProps {
  property: PropertyResponseDto;
}

export const PropertyPreviewItem = ({ property }: PropertyPreviewItemProps) => {
  const image = property.photos?.[0]?.url || FALLBACK_IMAGE;
  const address = [property.address?.location?.city, property.address?.street, property.address?.houseNumber]
    .filter(Boolean)
    .join(', ');

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <img src={image} alt={property.title} className="h-36 w-full object-cover" />
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {PROPERTY_STATUS_LABELS[property.status] || property.status}
          </span>
          <span className="text-sm font-bold text-slate-900">
            {formatMoney(property.pricing?.pricePerMonth || property.pricing?.pricePerNight, property.pricing?.currency || 'UAH')}
          </span>
        </div>
        <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{property.title}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{address || 'Адресу не вказано'}</p>
        <Link
          to={ROUTES.propertyDetails(property.id)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
        >
          Відкрити оголошення <ChevronRight size={14} />
        </Link>
      </div>
    </article>
  );
};
