import { BadgeCheck, BedDouble, Building2, CalendarDays, Layers, MessageCircle, Phone, Ruler, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';
import { PROPERTY_TYPE_LABELS } from './constants';
import { formatCreatedAt, formatPrice } from './utils';

interface PropertyDetailsSidebarProps {
  property: PropertyResponseDto;
  owner?: PublicUserProfileDto;
  ownerLoading: boolean;
  ownerName: string;
  ownerInitial: string;
  pricePerMonth: number;
  currency: string;
  onContactHost: () => void;
  disableContactHost?: boolean;
}

export const PropertyDetailsSidebar = ({
  property,
  owner,
  ownerLoading,
  ownerName,
  ownerInitial,
  pricePerMonth,
  currency,
  onContactHost,
  disableContactHost = false,
}: PropertyDetailsSidebarProps) => (
  <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Власник</p>
      {ownerLoading ? (
        <div className="mt-3 h-16 animate-pulse rounded-xl bg-slate-200" />
      ) : (
        <div className="mt-3 flex items-center gap-3">
          {owner?.avatarUrl ? (
            <img src={owner.avatarUrl} alt={ownerName} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
              {ownerInitial}
            </span>
          )}
          <div>
            <Link
              to={ROUTES.publicProfile(property.hostId)}
              className="font-bold text-slate-900 transition hover:text-blue-700 hover:underline"
            >
              {ownerName}
            </Link>
            <p className="text-sm text-slate-500">На платформі з {formatCreatedAt(owner?.createdAt)}</p>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <button
          type="button"
          onClick={onContactHost}
          disabled={disableContactHost}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <MessageCircle size={16} />
          {disableContactHost ? 'Це ваше оголошення' : 'Написати власнику'}
        </button>
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Phone size={16} />
          Показати телефон
        </button>
      </div>
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ціна оренди</p>
      <p className="mt-2 text-4xl font-black text-slate-900">{formatPrice(pricePerMonth, currency)}</p>
      <p className="mt-1 text-sm text-slate-500">на місяць</p>

      <div className="mt-5 space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Building2 size={16} className="text-slate-400" />
          {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Layers size={16} className="text-slate-400" />
          {property.floor || '-'} поверх {property.totalFloors ? `з ${property.totalFloors}` : ''}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Ruler size={16} className="text-slate-400" />
          {property.areaSqm ? `${property.areaSqm} м²` : 'Площа не вказана'}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <BedDouble size={16} className="text-slate-400" />
          {property.rooms || '-'} кімнат
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <CalendarDays size={16} className="text-slate-400" />
          Опубліковано {formatCreatedAt(property.createdAt)}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-100 p-4">
        <div className="flex items-center justify-between text-sm text-slate-700">
          <span className="inline-flex items-center gap-1">
            <Star size={14} className="text-amber-500" />
            Рейтинг
          </span>
          <strong>{Number(property.averageRating || 0).toFixed(1)}</strong>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
          <span>Відгуків</span>
          <strong>{property.reviewCount || 0}</strong>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
          <span>Переглядів</span>
          <strong>{property.viewCount || 0}</strong>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-700">
          <span className="inline-flex items-center gap-1">
            <BadgeCheck size={14} className="text-emerald-600" />
            Перевірене
          </span>
          <strong>{property.isVerifiedProperty ? 'Так' : 'Ні'}</strong>
        </div>
      </div>
    </section>
  </aside>
);
