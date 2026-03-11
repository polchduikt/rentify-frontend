import L from 'leaflet';
import { useState } from 'react';
import { Marker, Pane, useMap, useMapEvents } from 'react-leaflet';
import { LOW_ZOOM_TILE_MAX } from '@/constants/searchMap';
import { UKRAINE_REGION_LABELS } from '@/constants/ukraineRegionLabels';

const createRegionIcon = (label: string) =>
  L.divIcon({
    className: 'ukraine-region-static-label-wrap',
    html: `<span class="ukraine-region-static-label">${label}</span>`,
    iconSize: [140, 16],
    iconAnchor: [70, 8],
  });

export const UkraineRegionLabelsLayer = () => {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  if (zoom > LOW_ZOOM_TILE_MAX) {
    return null;
  }

  return (
    <Pane name="ukraine-region-labels" style={{ zIndex: 460, pointerEvents: 'none' }}>
      {UKRAINE_REGION_LABELS.map((region) => (
        <Marker
          key={region.name}
          position={[region.lat, region.lng]}
          icon={createRegionIcon(region.name)}
          interactive={false}
          keyboard={false}
        />
      ))}
    </Pane>
  );
};
