import { MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { formatPropertyCreatedAt } from '@/utils/propertyDetails';
import type { PropertyDetailsSidebarProps } from './PropertyDetailsSidebar.types';

export const PropertyDetailsSidebar = ({
  property,
  owner,
  ownerLoading,
  ownerName,
  ownerInitial,
  ownerPhone,
  isPhoneVisible,
  onContactHost,
  onShowPhone,
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
            <p className="text-sm text-slate-500">На платформі з {formatPropertyCreatedAt(owner?.createdAt)}</p>
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
          onClick={onShowPhone}
          disabled={!ownerPhone}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <Phone size={16} />
          {ownerPhone ? (isPhoneVisible ? ownerPhone : 'Показати телефон') : 'Телефон не вказано'}
        </button>
      </div>
    </section>
  </aside>
);
