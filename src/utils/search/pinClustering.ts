import type { PropertyMapPinDto } from '@/types/property';
import { toFiniteNumber } from '@/utils/searchMap';

const MIN_CLUSTER_ITEMS = 3;
const CLUSTERING_DISABLE_ZOOM = 12;

export interface ClusteredPinGroup {
  key: string;
  lat: number;
  lng: number;
  count: number;
  hasSelected: boolean;
}

export type ClusteredPinRenderable =
  | { type: 'pin'; pin: PropertyMapPinDto }
  | { type: 'cluster'; cluster: ClusteredPinGroup };

interface ClusterBucket {
  sumLat: number;
  sumLng: number;
  count: number;
  hasSelected: boolean;
  pins: PropertyMapPinDto[];
}

const resolveGridSize = (zoom: number): number => {
  if (zoom <= 6) {
    return 0.32;
  }
  if (zoom <= 8) {
    return 0.18;
  }
  if (zoom <= 10) {
    return 0.1;
  }
  return 0.06;
};

const resolveCellKey = (lat: number, lng: number, gridSize: number): string => {
  const latCell = Math.floor(lat / gridSize);
  const lngCell = Math.floor(lng / gridSize);
  return `${latCell}:${lngCell}`;
};

export const clusterMapPins = (
  pins: PropertyMapPinDto[],
  zoom: number,
  selectedPropertyId?: number,
): ClusteredPinRenderable[] => {
  if (pins.length === 0) {
    return [];
  }

  if (zoom >= CLUSTERING_DISABLE_ZOOM || pins.length < MIN_CLUSTER_ITEMS * 2) {
    return pins.map((pin) => ({ type: 'pin', pin }));
  }

  const gridSize = resolveGridSize(zoom);
  const buckets = new Map<string, ClusterBucket>();
  const directPins: ClusteredPinRenderable[] = [];

  for (const pin of pins) {
    const lat = toFiniteNumber(pin.lat);
    const lng = toFiniteNumber(pin.lng);
    if (lat == null || lng == null) {
      directPins.push({ type: 'pin', pin });
      continue;
    }

    const key = resolveCellKey(lat, lng, gridSize);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.sumLat += lat;
      bucket.sumLng += lng;
      bucket.count += 1;
      bucket.hasSelected ||= pin.id === selectedPropertyId;
      bucket.pins.push(pin);
      continue;
    }

    buckets.set(key, {
      sumLat: lat,
      sumLng: lng,
      count: 1,
      hasSelected: pin.id === selectedPropertyId,
      pins: [pin],
    });
  }

  const clustered: ClusteredPinRenderable[] = [];
  for (const [key, bucket] of buckets) {
    if (bucket.count < MIN_CLUSTER_ITEMS) {
      clustered.push(...bucket.pins.map((pin) => ({ type: 'pin', pin } as const)));
      continue;
    }

    clustered.push({
      type: 'cluster',
      cluster: {
        key,
        lat: bucket.sumLat / bucket.count,
        lng: bucket.sumLng / bucket.count,
        count: bucket.count,
        hasSelected: bucket.hasSelected,
      },
    });
  }

  return [...clustered, ...directPins];
};
