import { ChevronLeft, ChevronRight, LayoutGrid, List, Map, RotateCw } from 'lucide-react';
import { PropertyListItem } from '@/components/search/PropertyListItem';
import { SearchResultsMap } from '@/components/search/SearchResultsMap';
import type { SearchResultsSectionProps } from './SearchResultsSection.types';


export const SearchResultsSection = ({
  loading,
  error,
  filtered,
  visibleItems,
  viewMode,
  mapPinsLoading,
  mapPinsError,
  mapPins,
  selectedMapPropertyId,
  selectedMapProperty,
  currentPage,
  totalPages,
  visibleCount,
  paginationItems,
  favoriteIds,
  onViewModeChange,
  onOpenMapPage,
  onMapPropertySelect,
  onMapBoundsChange,
  onShowMore,
  onPrevPage,
  onNextPage,
  onPageChange,
}: SearchResultsSectionProps) => {
  const isMapView = viewMode === 'map';

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Оренда нерухомості</h1>
          <p className="mt-1 text-gray-500">{loading && !isMapView ? 'Завантаження...' : `${filtered.length} пропозицій`}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isMapView && (
            <div className="inline-flex rounded-full border border-gray-300 bg-white p-1">
              <button
                type="button"
                onClick={() => onViewModeChange('single')}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${
                  viewMode === 'single' ? 'bg-gray-900 text-white' : 'text-gray-700'
                }`}
              >
                <List size={16} /> 1 в ряд
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('double')}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${
                  viewMode === 'double' ? 'bg-gray-900 text-white' : 'text-gray-700'
                }`}
              >
                <LayoutGrid size={16} /> 2 в ряд
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => (isMapView ? onViewModeChange('single') : onOpenMapPage())}
            className={`inline-flex rounded-full px-5 py-2.5 text-sm font-semibold ${
              isMapView ? 'bg-[#1a2f5f] text-white' : 'bg-gray-900 text-white'
            }`}
          >
            {isMapView ? <List size={16} className="mr-2" /> : <Map size={16} className="mr-2" />}
            {isMapView ? 'Дивитися списком' : 'Дивитися на мапі'}
          </button>
        </div>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">{error}</div>}

      {isMapView ? (
        <>
          {mapPinsError && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">{mapPinsError}</div>
          )}

          <SearchResultsMap
            loading={mapPinsLoading}
            pins={mapPins}
            selectedPropertyId={selectedMapPropertyId}
            selectedProperty={selectedMapProperty}
            onSelectProperty={onMapPropertySelect}
            onMapBoundsChange={onMapBoundsChange}
          />
        </>
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          За обраними параметрами оголошення не знайдені.
        </div>
      ) : (
        <>
          <div className={viewMode === 'single' ? 'space-y-4' : 'grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2'}>
            {visibleItems.map((property) => (
              <PropertyListItem key={property.id} property={property} variant={viewMode} isFavorite={favoriteIds.has(property.id)} />
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {visibleCount < filtered.length && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onShowMore}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#13284f] px-7 font-semibold text-white shadow-[0_12px_26px_-18px_rgba(19,40,79,0.9)] transition hover:bg-[#102142]"
                >
                  <RotateCw size={16} />
                  Показати ще {Math.min(20, filtered.length - visibleCount)}
                </button>
              </div>
            )}

            <div className="rounded-3xl border border-[#d8e1f1] bg-gradient-to-br from-white via-[#f7f9fd] to-[#eef3fb] p-4 shadow-[0_18px_35px_-30px_rgba(19,40,79,0.75)] sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm font-medium text-[#405071]">
                  Показано {visibleCount} з {filtered.length}
                </p>

                <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#d8e2f3] bg-white/90 p-1.5 shadow-sm backdrop-blur">
                  <button
                    type="button"
                    onClick={onPrevPage}
                    disabled={currentPage === 1}
                    className="inline-flex h-10 items-center rounded-xl border border-[#cad7ee] bg-white px-3 text-[#1f3763] transition hover:border-[#9fb4d8] hover:bg-[#f3f7ff] disabled:border-[#e4e9f4] disabled:bg-[#f7f9fd] disabled:text-[#a6b1c5]"
                    aria-label="Попередня сторінка"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {paginationItems.map((item) =>
                    typeof item === 'number' ? (
                      <button
                        key={item}
                        type="button"
                        onClick={() => onPageChange(item)}
                        className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold transition ${
                          item === currentPage
                            ? 'border-[#13284f] bg-gradient-to-br from-[#13284f] to-[#1f3f79] text-white shadow-[0_12px_24px_-18px_rgba(19,40,79,0.95)]'
                            : 'border-[#cad7ee] bg-white text-[#1f3763] hover:border-[#9fb4d8] hover:bg-[#f3f7ff]'
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span
                        key={item}
                        className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-[#e2e8f4] bg-[#f8faff] px-3 text-[#9ba9c2]"
                      >
                        ...
                      </span>
                    )
                  )}

                  <button
                    type="button"
                    onClick={onNextPage}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 items-center rounded-xl border border-[#cad7ee] bg-white px-3 text-[#1f3763] transition hover:border-[#9fb4d8] hover:bg-[#f3f7ff] disabled:border-[#e4e9f4] disabled:bg-[#f7f9fd] disabled:text-[#a6b1c5]"
                    aria-label="Наступна сторінка"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
