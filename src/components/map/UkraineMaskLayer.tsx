import { GeoJSON } from 'react-leaflet';
import { UKRAINE_GEOJSON_BORDER, UKRAINE_GEOJSON_HOLE } from '@/utils/ukraineMask';

export const UkraineMaskLayer = () => (
  <>
    <GeoJSON
      data={UKRAINE_GEOJSON_HOLE}
      interactive={false}
      style={{
        fillColor: '#9ca3af',
        fillOpacity: 1,
        stroke: false,
        color: 'transparent',
      }}
    />
    <GeoJSON
      data={UKRAINE_GEOJSON_BORDER}
      interactive={false}
      style={{
        fill: false,
        color: '#64748b',
        opacity: 0.85,
        weight: 4,
      }}
    />
    <GeoJSON
      data={UKRAINE_GEOJSON_BORDER}
      interactive={false}
      style={{
        fill: false,
        color: '#ffffff',
        opacity: 1,
        weight: 2.4,
      }}
    />
  </>
);
