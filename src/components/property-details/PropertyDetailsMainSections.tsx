import { ChevronLeft, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { PROPERTY_CREATE_AMENITY_CATEGORY_LABELS } from '@/constants/propertyCreateUi';
import { ROUTES } from '@/config/routes';
import type { AmenityDto, PropertyResponseDto } from '@/types/property';
import { MapInvalidateSize } from './MapInvalidateSize';
import { MARKET_TYPE_LABELS, PROPERTY_TYPE_LABELS } from './constants';
import { formatCreatedAt, yesNo } from './utils';
import { RecommendedPropertyCard } from './RecommendedPropertyCard';

interface PropertyDetailsMainSectionsProps {
  property: PropertyResponseDto;
  activePhoto: string;
  photos: string[];
  activePhotoIndex: number;
  onPhotoSelect: (index: number) => void;
  city: string;
  addressLine: string;
  groupedAmenities: Array<{ category: string; amenities: AmenityDto[] }>;
  mapCenter: [number, number];
  hasExactMapCoords: boolean;
  mapCoordsLoading: boolean;
  recommendationsLoading: boolean;
  recommendedVisible: PropertyResponseDto[];
  canSlidePrev: boolean;
  canSlideNext: boolean;
  onSlidePrev: () => void;
  onSlideNext: () => void;
}

export const PropertyDetailsMainSections = ({
  property,
  activePhoto,
  photos,
  activePhotoIndex,
  onPhotoSelect,
  city,
  addressLine,
  groupedAmenities,
  mapCenter,
  hasExactMapCoords,
  mapCoordsLoading,
  recommendationsLoading,
  recommendedVisible,
  canSlidePrev,
  canSlideNext,
  onSlidePrev,
  onSlideNext,
}: PropertyDetailsMainSectionsProps) => (
  <div className="space-y-6">
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <img src={activePhoto} alt={property.title} className="h-[440px] w-full object-cover" />
      {photos.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 border-t border-slate-200 p-3 sm:grid-cols-6 lg:grid-cols-7">
          {photos.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => onPhotoSelect(index)}
              className={`overflow-hidden rounded-xl border-2 ${
                index === activePhotoIndex ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <img src={photo} alt="" className="h-16 w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Інформація про оголошення</h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {MARKET_TYPE_LABELS[property.marketType] || property.marketType}
        </span>
        {property.isTopPromoted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <Sparkles size={12} />
            ТОП оголошення
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 text-3xl font-black leading-tight text-slate-900">{property.title}</h1>
      <p className="mt-2 flex items-center gap-2 text-slate-600">
        <MapPin size={16} className="text-blue-600" />
        {city}
        {addressLine ? <span className="text-slate-400">•</span> : null}
        {addressLine}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Кімнат</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{property.rooms || '-'}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Площа</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{property.areaSqm ? `${property.areaSqm} м²` : '-'}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Поверх</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {property.floor || '-'} {property.totalFloors ? `/ ${property.totalFloors}` : ''}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Опубліковано</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCreatedAt(property.createdAt)}</p>
        </div>
      </div>
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Опис</h2>
      <p className="mt-3 whitespace-pre-line break-words [overflow-wrap:anywhere] text-[15px] leading-relaxed text-slate-700">
        {property.description || 'Опис відсутній.'}
      </p>
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Зручності</h2>
      {groupedAmenities.length === 0 ? (
        <p className="mt-3 text-slate-600">Зручності не вказані.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {groupedAmenities.map((group) => (
            <div key={group.category}>
              <p className="mb-2 text-sm font-bold text-slate-700">
                {PROPERTY_CREATE_AMENITY_CATEGORY_LABELS[group.category as keyof typeof PROPERTY_CREATE_AMENITY_CATEGORY_LABELS] ||
                  group.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.amenities.map((amenity) => (
                  <span key={amenity.id} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                    {amenity.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Правила проживання</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Тварини</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{yesNo(property.rules?.petsAllowed)}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Куріння</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{yesNo(property.rules?.smokingAllowed)}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Вечірки</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{yesNo(property.rules?.partiesAllowed)}</p>
        </div>
      </div>
      {property.rules?.additionalRules ? (
        <p className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm leading-relaxed text-slate-700">{property.rules.additionalRules}</p>
      ) : null}
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Розташування</p>
      <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer
          key={`${mapCenter[0]}-${mapCenter[1]}`}
          center={mapCenter}
          zoom={hasExactMapCoords ? 14 : 11}
          scrollWheelZoom={false}
          className="h-[280px] w-full"
          style={{ height: 280, minHeight: 280 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInvalidateSize />
          <CircleMarker center={mapCenter} radius={9} pathOptions={{ color: '#1d4ed8', fillColor: '#2563eb', fillOpacity: 0.9 }} />
        </MapContainer>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        <MapPin size={14} className="mr-1 inline-block text-blue-600" />
        {city}
        {addressLine ? `, ${addressLine}` : ''}
      </p>
      {mapCoordsLoading ? <p className="mt-1 text-xs text-slate-500">Визначаю координати на мапі...</p> : null}
      <Link
        to={`${ROUTES.searchMap}?city=${encodeURIComponent(city)}&rentalType=LONG_TERM`}
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
      >
        Подивитися інші пропозиції
      </Link>
    </section>

    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">Рекомендовані пропозиції</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSlidePrev}
            disabled={!canSlidePrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Попередні пропозиції"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={onSlideNext}
            disabled={!canSlideNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Наступні пропозиції"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {recommendationsLoading ? (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : recommendedVisible.length === 0 ? (
        <p className="mt-4 text-slate-600">Поки що немає рекомендацій у цьому місті.</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recommendedVisible.map((item) => (
            <RecommendedPropertyCard key={item.id} property={item} />
          ))}
        </div>
      )}
    </section>
  </div>
);
