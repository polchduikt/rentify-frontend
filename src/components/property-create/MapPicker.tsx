import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { DEFAULT_MAP_CENTER } from '@/constants/propertyCreateOptions';
import type { MapPickerProps } from './MapPicker.types';

const mapPinIcon = L.divIcon({
  className: 'rentify-map-pin',
  html: '<span class="rentify-map-pin__dot"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});


const MapClickHandler = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
};

const MapCenterSync = ({ lat, lng }: { lat?: number; lng?: number }) => {
  const map = useMap();

  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], Math.max(map.getZoom(), 13));
    }
  }, [lat, lng, map]);

  return null;
};

const MapResizeFix = () => {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [map]);

  return null;
};

export const MapPicker = ({ lat, lng, onPick }: MapPickerProps) => {
  const markerPosition = useMemo(() => (lat != null && lng != null ? ([lat, lng] as [number, number]) : null), [lat, lng]);
  const center = markerPosition ?? ([DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng] as [number, number]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={center} zoom={11} scrollWheelZoom className="h-[320px] w-full" style={{ minHeight: 320 }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapResizeFix />
        <MapClickHandler onPick={onPick} />
        <MapCenterSync lat={lat} lng={lng} />
        {markerPosition ? <Marker position={markerPosition} icon={mapPinIcon} /> : null}
      </MapContainer>
    </div>
  );
};
