import { useEffect, useRef } from 'react';
import type L from 'leaflet';
import { useMap, useMapEvents } from 'react-leaflet';
import { UKRAINE_LOCKED_MIN_ZOOM } from '@/constants/searchMap';
import type { SearchMapBounds } from '@/types/search';
import { UKRAINE_VIEW_BOUNDS } from '@/utils/ukraineMask';
import type { UkraineViewportSyncProps } from './UkraineViewportSync.types';

const extractBounds = (map: L.Map): SearchMapBounds => {
  const bounds = map.getBounds();
  return {
    southWestLat: bounds.getSouthWest().lat,
    southWestLng: bounds.getSouthWest().lng,
    northEastLat: bounds.getNorthEast().lat,
    northEastLng: bounds.getNorthEast().lng,
  };
};


export const UkraineViewportSync = ({ onBoundsChange, onMapClick }: UkraineViewportSyncProps) => {
  const map = useMap();
  const hasInitedRef = useRef(false);

  useEffect(() => {
    if (hasInitedRef.current) {
      return;
    }

    hasInitedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(UKRAINE_VIEW_BOUNDS, { padding: [0, 0], animate: false });
      const lockedZoom = Math.max(map.getZoom(), UKRAINE_LOCKED_MIN_ZOOM);
      map.setZoom(lockedZoom, { animate: false });
      map.setMinZoom(lockedZoom);
      onBoundsChange(extractBounds(map));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [map, onBoundsChange]);

  useMapEvents({
    moveend: () => onBoundsChange(extractBounds(map)),
    zoomend: () => onBoundsChange(extractBounds(map)),
    click: () => onMapClick?.(),
  });

  return null;
};
