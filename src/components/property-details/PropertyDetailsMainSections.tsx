import {
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  Layers,
  Maximize2,
  MapPin,
  Ruler,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleMarker, MapContainer, TileLayer } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { MARKET_TYPE_LABELS, PROPERTY_TYPE_LABELS } from '@/constants/propertyDetails';
import { PROPERTY_CREATE_AMENITY_CATEGORY_LABELS } from '@/constants/propertyCreateUi';
import { ROUTES } from '@/config/routes';
import { useAddToFavoritesMutation, useRemoveFromFavoritesMutation } from '@/hooks/api/useFavoriteApi';
import { formatPropertyCreatedAt, formatPropertyPrice, yesNo } from '@/utils/propertyDetails';
import { MapInvalidateSize } from './MapInvalidateSize';
import { RecommendedPropertyCard } from './RecommendedPropertyCard';
import type { PropertyDetailsMainSectionsProps } from './PropertyDetailsMainSections.types';


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
  isFavorite = false,
  favoriteIds = new Set(),
  shortTermBookingSection = null,
  shortTermReviewsSection = null,
}: PropertyDetailsMainSectionsProps) => {
  const [isLocalFavorite, setIsLocalFavorite] = useState(isFavorite);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const addToFavoritesMutation = useAddToFavoritesMutation();
  const removeFromFavoritesMutation = useRemoveFromFavoritesMutation();

  const isLoading = addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending;
  const isLongTerm = property.rentalType === 'LONG_TERM';
  const hasPhotoNavigation = photos.length > 1;
  const descriptionText = property.description?.trim() || '';
  const isDescriptionLong = descriptionText.length > 420;

  const handlePhotoNavigate = (direction: 'prev' | 'next') => {
    if (!hasPhotoNavigation) {
      return;
    }

    const nextIndex =
      direction === 'next'
        ? (activePhotoIndex + 1) % photos.length
        : (activePhotoIndex - 1 + photos.length) % photos.length;

    onPhotoSelect(nextIndex);
  };

  useEffect(() => {
    if (!isPhotoViewerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPhotoViewerOpen(false);
        return;
      }
      if (event.key === 'ArrowLeft') {
        if (photos.length > 1) {
          onPhotoSelect((activePhotoIndex - 1 + photos.length) % photos.length);
        }
        return;
      }
      if (event.key === 'ArrowRight') {
        if (photos.length > 1) {
          onPhotoSelect((activePhotoIndex + 1) % photos.length);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isPhotoViewerOpen, activePhotoIndex, photos.length, onPhotoSelect]);

  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [property.id]);

  const handleFavoriteClick = async () => {
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
      <div className="space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="group relative bg-slate-100">
            <img src={activePhoto} alt={property.title} className="h-[480px] w-full object-cover"/>
            <button
              type="button"
              onClick={() => setIsPhotoViewerOpen(true)}
              className="absolute inset-0 z-10 cursor-zoom-in"
              aria-label="Відкрити фото на весь екран"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />

            {hasPhotoNavigation ? (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePhotoNavigate('prev');
                  }}
                  className="absolute left-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-100 shadow-sm transition hover:bg-white md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Попереднє фото"
                >
                  <ChevronLeft size={20}/>
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePhotoNavigate('next');
                  }}
                  className="absolute right-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-100 shadow-sm transition hover:bg-white md:opacity-0 md:group-hover:opacity-100"
                  aria-label="Наступне фото"
                >
                  <ChevronRight size={20}/>
                </button>
              </>
            ) : null}

            <div className="absolute bottom-3 left-3 z-20 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white">
              Фото {activePhotoIndex + 1} / {photos.length}
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsPhotoViewerOpen(true);
              }}
              className="absolute right-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-white"
              aria-label="Відкрити повнорозмірне фото"
            >
              <Maximize2 size={14}/>
              Повний розмір
            </button>
          </div>

          {hasPhotoNavigation ? (
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
                      <img src={photo} alt="" className="h-16 w-full object-cover"/>
                    </button>
                ))}
              </div>
          ) : null}
        </section>

        {isPhotoViewerOpen && typeof document !== 'undefined'
          ? createPortal(
              <div
                className="fixed inset-0 z-[3000] h-[100dvh] w-screen overflow-hidden bg-slate-950/95 p-3 sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-label="Перегляд фотографій"
                onClick={() => setIsPhotoViewerOpen(false)}
              >
                <div className="relative flex h-full w-full flex-col" onClick={(event) => event.stopPropagation()}>
                  <div className="mb-3 flex items-center justify-between gap-3 text-white">
                    <p className="line-clamp-1 text-sm font-semibold">{property.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        {activePhotoIndex + 1} / {photos.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPhotoViewerOpen(false)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 transition hover:bg-slate-200"
                        aria-label="Закрити перегляд фото"
                      >
                        <X size={18}/>
                      </button>
                    </div>
                  </div>

                  <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[minmax(0,1fr)_88px]">
                    <div className="relative flex min-h-0 items-center justify-center rounded-2xl bg-black/35 px-2 sm:px-8">
                      <img src={activePhoto} alt={property.title} className="max-h-full max-w-full rounded-xl object-contain"/>

                      {hasPhotoNavigation ? (
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handlePhotoNavigate('prev');
                            }}
                            className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:bg-slate-100"
                            aria-label="Попереднє фото"
                          >
                            <ChevronLeft size={22}/>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handlePhotoNavigate('next');
                            }}
                            className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:bg-slate-100"
                            aria-label="Наступне фото"
                          >
                            <ChevronRight size={22}/>
                          </button>
                        </>
                      ) : null}
                    </div>

                    {hasPhotoNavigation ? (
                      <div className="hidden min-h-0 md:block">
                        <div className="h-full overflow-y-auto pr-1">
                          <div className="flex flex-col gap-2">
                            {photos.map((photo, index) => (
                              <button
                                key={`fullscreen-thumb-${photo}-${index}`}
                                type="button"
                                onClick={() => onPhotoSelect(index)}
                                className={`overflow-hidden rounded-xl border-2 transition ${
                                  index === activePhotoIndex
                                    ? 'border-blue-400'
                                    : 'border-transparent opacity-75 hover:opacity-100'
                                }`}
                                aria-label={`Відкрити фото ${index + 1}`}
                              >
                                <img src={photo} alt="" className="h-16 w-full object-cover"/>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {hasPhotoNavigation ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
                      {photos.map((photo, index) => (
                        <button
                          key={`mobile-fullscreen-thumb-${photo}-${index}`}
                          type="button"
                          onClick={() => onPhotoSelect(index)}
                          className={`overflow-hidden rounded-lg border-2 transition ${
                            index === activePhotoIndex ? 'border-blue-400' : 'border-transparent opacity-80'
                          }`}
                          aria-label={`Відкрити фото ${index + 1}`}
                        >
                          <img src={photo} alt="" className="h-14 w-20 object-cover"/>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>,
              document.body,
            )
          : null}

        {shortTermBookingSection}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Інформація про оголошення</h2>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
            </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {MARKET_TYPE_LABELS[property.marketType] || property.marketType}
            </span>
              {property.isTopPromoted ? (
                  <span
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                <Sparkles size={12}/>
                ТОП оголошення
              </span>
              ) : null}
            </div>
            <button
                onClick={handleFavoriteClick}
                className="inline-flex items-center justify-center rounded-lg bg-slate-100 p-2 transition hover:bg-slate-200"
                aria-label={isLocalFavorite ? 'Видалити з улюблених' : 'Додати в улюблене'}
                disabled={isLoading}
            >
              <Heart
                  size={20}
                  fill={isLocalFavorite ? '#ef4444' : 'none'}
                  color={isLocalFavorite ? '#ef4444' : '#64748b'}
              />
            </button>
          </div>

          <h1 className="mt-4 text-3xl font-black leading-tight text-slate-900">{property.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-slate-600">
            <MapPin size={16} className="text-blue-600"/>
            {city}
            {addressLine ? <span className="text-slate-400">•</span> : null}
            {addressLine}
          </p>

          {isLongTerm ? (
            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ціна оренди</p>
                <p className="mt-2 text-4xl font-black text-slate-900">
                  {formatPropertyPrice(property.pricing?.pricePerMonth || 0, property.pricing?.currency || 'UAH')}
                </p>
                <p className="mt-1 text-sm text-slate-500">на місяць</p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                  <div className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                    <CalendarDays size={16} className="text-slate-400" />
                    Опубліковано {formatPropertyCreatedAt(property.createdAt)}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5">
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
            </div>
          ) : null}

          <div className={`mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${isLongTerm ? 'hidden' : ''}`}>
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
              <p className="mt-1 text-xl font-bold text-slate-900">{formatPropertyCreatedAt(property.createdAt)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Опис</h2>
          <div className="relative mt-3">
            <p
              className={`whitespace-pre-line break-words [overflow-wrap:anywhere] text-[15px] leading-relaxed text-slate-700 ${
                isDescriptionLong && !isDescriptionExpanded ? 'max-h-[220px] overflow-hidden' : ''
              }`}
            >
              {property.description || 'Опис відсутній.'}
            </p>

            {isDescriptionLong && !isDescriptionExpanded ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white via-white/95 to-transparent" />
            ) : null}
          </div>

          {isDescriptionLong ? (
            <button
              type="button"
              onClick={() => setIsDescriptionExpanded((prev) => !prev)}
              className="mt-3 inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              {isDescriptionExpanded ? 'Сховати' : 'Розкрити повністю'}
            </button>
          ) : null}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Зручності</h2>
          {groupedAmenities.length === 0 ? (
              <p className="mt-3 text-slate-600">Зручності не вказані.</p>
          ) : (
              <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2">
                {groupedAmenities.map((group) => (
                  <div key={group.category}>
                    <p className="mb-2 text-sm font-bold text-slate-700">
                      {PROPERTY_CREATE_AMENITY_CATEGORY_LABELS[group.category as keyof typeof PROPERTY_CREATE_AMENITY_CATEGORY_LABELS] ||
                        group.category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.amenities.map((amenity) => (
                        <span
                          key={amenity.id}
                          className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-slate-700"
                        >
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
                style={{height: 280, minHeight: 280}}
            >
              <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapInvalidateSize/>
              <CircleMarker center={mapCenter} radius={9}
                            pathOptions={{color: '#1d4ed8', fillColor: '#2563eb', fillOpacity: 0.9}}/>
            </MapContainer>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            <MapPin size={14} className="mr-1 inline-block text-blue-600"/>
            {city}
            {addressLine ? `, ${addressLine}` : ''}
          </p>
          {mapCoordsLoading ? <p className="mt-1 text-xs text-slate-500">Визначаю координати на мапі...</p> : null}
          <Link
              to={`${ROUTES.searchMap}?city=${encodeURIComponent(city)}&rentalType=${encodeURIComponent(property.rentalType || 'LONG_TERM')}`}
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
                <ChevronLeft size={16}/>
              </button>
              <button
                  type="button"
                  onClick={onSlideNext}
                  disabled={!canSlideNext}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Наступні пропозиції"
              >
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>

          {recommendationsLoading ? (
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {Array.from({length: 3}).map((_, index) => (
                    <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-200"/>
                ))}
              </div>
          ) : recommendedVisible.length === 0 ? (
              <p className="mt-4 text-slate-600">Поки що немає рекомендацій у цьому місті.</p>
          ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {recommendedVisible.map((item) => (
                    <RecommendedPropertyCard
                        key={item.id}
                        property={item}
                        isFavorite={item.id ? favoriteIds.has(item.id) : false}
                    />
                ))}
              </div>
          )}
        </section>

        {shortTermReviewsSection}
      </div>
  );
}
