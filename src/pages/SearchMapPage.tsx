import { useEffect } from 'react';
import L from 'leaflet';
import { List } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MapContainer, ZoomControl } from 'react-leaflet';
import { UkraineBaseTileLayers } from '@/components/map/UkraineBaseTileLayers';
import { UkraineRegionLabelsLayer } from '@/components/map/UkraineRegionLabelsLayer';
import { UkraineRegionsLayer } from '@/components/map/UkraineRegionsLayer';
import { UkraineViewportSync } from '@/components/map/UkraineViewportSync';
import { UkraineMaskLayer } from '@/components/map/UkraineMaskLayer';
import { ClusteredPropertyMarkers } from '@/components/search/ClusteredPropertyMarkers';
import { SearchFiltersPanel } from '@/components/search/SearchFiltersPanel';
import { SearchMapPropertyCard } from '@/components/search/SearchMapPropertyCard';
import { ROUTES } from '@/config/routes';
import { UKRAINE_LOCKED_MIN_ZOOM, UKRAINE_MAP_CENTER, UKRAINE_MAX_ZOOM } from '@/constants/searchMap';
import { useSearchPage } from '@/hooks';
import { UKRAINE_VIEW_BOUNDS } from '@/utils/ukraineMask';

const UKRAINE_MAP_RENDERER = L.svg({ padding: 1 });

const SearchMapPage = () => {
  const model = useSearchPage();
  const location = useLocation();
  const { viewMode, setViewMode } = model;

  useEffect(() => {
    if (viewMode !== 'map') {
      setViewMode('map');
    }
  }, [setViewMode, viewMode]);

  const mapPins = model.mapPins;
  const isSidebarVisible = model.selectedMapPropertyId != null;

  const listSearchParams = new URLSearchParams(location.search);
  if (listSearchParams.get('view') === 'map') {
    listSearchParams.delete('view');
  }
  const listUrl = `${ROUTES.search}${listSearchParams.toString() ? `?${listSearchParams.toString()}` : ''}`;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapContainer
        center={UKRAINE_MAP_CENTER}
        zoom={6}
        minZoom={UKRAINE_LOCKED_MIN_ZOOM}
        maxZoom={UKRAINE_MAX_ZOOM}
        maxBounds={UKRAINE_VIEW_BOUNDS}
        maxBoundsViscosity={1}
        inertia={false}
        renderer={UKRAINE_MAP_RENDERER}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
      >
        <UkraineBaseTileLayers />
        <UkraineMaskLayer />
        <UkraineRegionsLayer />
        <UkraineRegionLabelsLayer />
        <ZoomControl position="bottomright" />
        <UkraineViewportSync
          onBoundsChange={model.handleMapBoundsChange}
          onMapClick={() => model.setSelectedMapPropertyId(undefined)}
        />

        <ClusteredPropertyMarkers
          pins={mapPins}
          selectedPropertyId={model.selectedMapPropertyId}
          onSelectProperty={model.setSelectedMapPropertyId}
        />
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[700] p-3">
        <div className="pointer-events-auto">
          <SearchFiltersPanel
            mode="map"
            mapFormAction={
              <Link
                to={listUrl}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#13284f] px-6 text-sm font-semibold text-white shadow-md hover:bg-[#102142]"
              >
                <List size={16} className="mr-2" />
                Дивитися списком
              </Link>
            }
            cityInput={model.cityInput}
            rentalType={model.rentalType}
            priceFrom={model.priceFrom}
            priceTo={model.priceTo}
            roomsMin={model.roomsMin}
            roomsMax={model.roomsMax}
            areaFrom={model.areaFrom}
            areaTo={model.areaTo}
            extra={model.extra}
            sortMode={model.sortMode}
            extraCount={model.extraCount}
            filteredCount={model.filtered.length}
            suggestions={model.suggestions}
            suggestionsLoading={model.suggestionsLoading}
            amenitiesGrouped={model.amenitiesGrouped}
            amenitiesLoading={model.amenitiesLoading}
            onCityInputChange={model.setCityInput}
            onLocationSuggestionSelect={model.handleLocationSuggestionSelect}
            onRentalTypeChange={model.handleRentalTypeChange}
            onPriceFromChange={model.setPriceFrom}
            onPriceToChange={model.setPriceTo}
            onRoomsSelect={model.handleRoomsSelect}
            onRoomsMaxChange={model.setRoomsMax}
            onAreaFromChange={model.setAreaFrom}
            onAreaToChange={model.setAreaTo}
            onExtraDraftChange={model.handleExtraDraftChange}
            onExtraImmediateChange={model.handleExtraImmediateChange}
            onAmenitySlugToggle={model.handleAmenitySlugToggle}
            onAmenityCategoryToggle={model.handleAmenityCategoryToggle}
            onSortModeChange={model.handleSortModeChange}
            onCommitFilters={model.handleFiltersCommit}
            onResetAllFilters={model.handleResetAllFilters}
          />
        </div>
      </div>

      {model.mapPinsLoading && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-[650] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg">
          Оновлюємо оголошення...
        </div>
      )}

      {model.mapPinsError && (
        <div className="pointer-events-none absolute left-1/2 top-16 z-[650] -translate-x-1/2 rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-700 shadow-lg">
          {model.mapPinsError}
        </div>
      )}

      {isSidebarVisible && (
        <SearchMapPropertyCard
          property={model.selectedMapProperty}
          onClose={() => model.setSelectedMapPropertyId(undefined)}
        />
      )}
    </div>
  );
};

export default SearchMapPage;
