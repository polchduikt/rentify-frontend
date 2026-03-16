import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const MapInvalidateSize = () => {
  const map = useMap();

  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(id);
  }, [map]);

  return null;
};
