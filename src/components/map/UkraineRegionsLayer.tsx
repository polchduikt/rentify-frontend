import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { FeatureCollection, Geometry } from 'geojson';

const REGIONS_GEOJSON_URL =
  'https://raw.githubusercontent.com/ultra-ukraine/ukraine-geojson/main/ukraine_regions.geojson';

export const UkraineRegionsLayer = () => {
  const [regionsGeoJson, setRegionsGeoJson] = useState<FeatureCollection<Geometry> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch(REGIONS_GEOJSON_URL, { signal: controller.signal });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as FeatureCollection<Geometry>;
        setRegionsGeoJson(payload);
      } catch {
        // Keep map functional even if regions layer cannot be loaded.
      }
    };

    void load();
    return () => controller.abort();
  }, []);

  if (!regionsGeoJson) {
    return null;
  }

  return (
    <GeoJSON
      data={regionsGeoJson}
      interactive={false}
      style={{
        fill: false,
        color: '#ffffff',
        opacity: 0.92,
        weight: 1.35,
      }}
    />
  );
};
