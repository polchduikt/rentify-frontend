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
                <List size={16} /> 1 РІ ряд
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('double')}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold ${
                  viewMode === 'double' ? 'bg-gray-900 text-white' : 'text-gray-700'
                }`}
              >
                <LayoutGrid size={16} /> 2 РІ ряд
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
              <PropertyListItem key={property.id} property={property} variant={viewMode} />
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {visibleCount < filtered.length && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onShowMore}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-[#1a2f5f]/40 bg-white px-7 font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <RotateCw size={16} />
                  Показати ще {Math.min(20, filtered.length - visibleCount)}
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-sm text-gray-600">
                  Показано {visibleCount} з {filtered.length}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={onPrevPage}
                    disabled={currentPage === 1}
                    className="inline-flex h-10 items-center rounded-xl border border-gray-300 bg-white px-3 text-gray-700 disabled:border-gray-200 disabled:text-gray-300"
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
                        className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold ${
                          item === currentPage
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span
                        key={item}
                        className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-gray-400"
                      >
                        ...
                      </span>
                    )
                  )}

                  <button
                    type="button"
                    onClick={onNextPage}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-10 items-center rounded-xl border border-gray-300 bg-white px-3 text-gray-700 disabled:border-gray-200 disabled:text-gray-300"
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
