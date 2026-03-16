import { useMemo, useState } from 'react';
import { Marker, useMap, useMapEvents } from 'react-leaflet';
import type { PropertyMapPinDto } from '@/types/property';
import { clusterMapPins } from '@/utils/search/pinClustering';
import { createClusterPinIcon, createPricePinIcon, formatMapPinLabel, toPinPosition } from '@/utils/searchMap';

interface ClusteredPropertyMarkersProps {
  pins: PropertyMapPinDto[];
  selectedPropertyId?: number;
  onSelectProperty: (propertyId: number) => void;
}

export const ClusteredPropertyMarkers = ({
  pins,
  selectedPropertyId,
  onSelectProperty,
}: ClusteredPropertyMarkersProps) => {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const clusteredPins = useMemo(
    () => clusterMapPins(pins, zoom, selectedPropertyId),
    [pins, selectedPropertyId, zoom],
  );
  const markerIcons = useMemo(
    () =>
      new Map(
        clusteredPins
          .filter((item): item is { type: 'pin'; pin: PropertyMapPinDto } => item.type === 'pin')
          .map((item) => [
            item.pin.id,
            createPricePinIcon(formatMapPinLabel(item.pin), item.pin.id === selectedPropertyId),
          ]),
      ),
    [clusteredPins, selectedPropertyId],
  );

  return (
    <>
      {clusteredPins.map((item) => {
        if (item.type === 'pin') {
          const position = toPinPosition(item.pin);
          const icon = markerIcons.get(item.pin.id);
          if (!position || !icon) {
            return null;
          }
          return (
            <Marker
              key={`pin-${item.pin.id}`}
              position={position}
              icon={icon}
              bubblingMouseEvents={false}
              eventHandlers={{
                click: () => onSelectProperty(item.pin.id),
              }}
            />
          );
        }

        const icon = createClusterPinIcon(item.cluster.count, item.cluster.hasSelected);
        const nextZoom = Math.min(map.getMaxZoom(), Math.max(map.getZoom() + 2, 10));
        return (
          <Marker
            key={`cluster-${item.cluster.key}`}
            position={[item.cluster.lat, item.cluster.lng]}
            icon={icon}
            bubblingMouseEvents={false}
            eventHandlers={{
              click: () => {
                map.flyTo([item.cluster.lat, item.cluster.lng], nextZoom, { duration: 0.25 });
              },
            }}
          />
        );
      })}
    </>
  );
};
