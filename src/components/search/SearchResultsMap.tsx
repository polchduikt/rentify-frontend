import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapContainer, useMap } from 'react-leaflet';
import { UkraineBaseTileLayers } from '@/components/map/UkraineBaseTileLayers';
import { UkraineRegionLabelsLayer } from '@/components/map/UkraineRegionLabelsLayer';
import { UkraineRegionsLayer } from '@/components/map/UkraineRegionsLayer';
import { UkraineViewportSync } from '@/components/map/UkraineViewportSync';
import { UkraineMaskLayer } from '@/components/map/UkraineMaskLayer';
import { ClusteredPropertyMarkers } from '@/components/search/ClusteredPropertyMarkers';
import { PropertyListItem } from '@/components/search/PropertyListItem';
import { UKRAINE_LOCKED_MIN_ZOOM, UKRAINE_MAP_CENTER, UKRAINE_MAX_ZOOM } from '@/constants/searchMap';
import { toPinPosition } from '@/utils/searchMap';
import { UKRAINE_VIEW_BOUNDS } from '@/utils/ukraineMask';
import type { SearchResultsMapProps, SearchResultsMapSelectionSyncProps } from './SearchResultsMap.types';

const UKRAINE_MAP_RENDERER = L.svg({ padding: 1 });


const SearchResultsMapSelectionSync = ({ pins, selectedPropertyId }: SearchResultsMapSelectionSyncProps) => {
  const map = useMap();
  const hasFittedRef = useRef(false);

  useEffect(() => {
    if (pins.length === 0 || hasFittedRef.current) {
      return;
    }

    const positions = pins.map(toPinPosition).filter((position): position is [number, number] => position != null);
    if (positions.length === 0) {
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 12);
    } else {
      map.fitBounds(positions, { padding: [48, 48], maxZoom: 12 });
    }
    hasFittedRef.current = true;
  }, [map, pins]);

  useEffect(() => {
    if (selectedPropertyId == null) {
      return;
    }

    const selectedPin = pins.find((pin) => pin.id === selectedPropertyId);
    const position = selectedPin ? toPinPosition(selectedPin) : null;
    if (!position) {
      return;
    }

    map.flyTo(position, Math.max(map.getZoom(), 11), { duration: 0.35 });
  }, [map, pins, selectedPropertyId]);

  return null;
};

export const SearchResultsMap = ({
  loading,
  pins,
  selectedPropertyId,
  selectedProperty,
  onSelectProperty,
  onMapBoundsChange,
}: SearchResultsMapProps) => {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <MapContainer
          center={UKRAINE_MAP_CENTER}
          zoom={6}
          minZoom={UKRAINE_LOCKED_MIN_ZOOM}
          maxZoom={UKRAINE_MAX_ZOOM}
          maxBounds={UKRAINE_VIEW_BOUNDS}
          maxBoundsViscosity={1}
          inertia={false}
          renderer={UKRAINE_MAP_RENDERER}
          scrollWheelZoom
          className="h-[68vh] min-h-[500px] w-full"
          style={{ minHeight: 500 }}
        >
          <UkraineBaseTileLayers />
          <UkraineMaskLayer />
          <UkraineRegionsLayer />
          <UkraineRegionLabelsLayer />
          <UkraineViewportSync onBoundsChange={onMapBoundsChange} />
          <SearchResultsMapSelectionSync pins={pins} selectedPropertyId={selectedPropertyId} />
          <ClusteredPropertyMarkers
            pins={pins}
            selectedPropertyId={selectedPropertyId}
            onSelectProperty={onSelectProperty}
          />
        </MapContainer>

        {loading && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
            <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-gray-700 shadow">
              Оновлюємо точки на мапі...
            </div>
          </div>
        )}

        {!loading && pins.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <div className="rounded-xl bg-white/95 px-5 py-3 text-center text-sm text-gray-600 shadow">
              За поточними фільтрами немає оголошень з координатами.
            </div>
          </div>
        )}
      </section>

      <aside className="min-h-[240px] rounded-2xl border border-gray-200 bg-white p-3 xl:sticky xl:top-4 xl:h-[68vh] xl:overflow-auto">
        {selectedProperty ? (
          <PropertyListItem property={selectedProperty} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
            Виберіть ціну на мапі, щоб переглянути оголошення.
          </div>
        )}
      </aside>
    </div>
  );
};
