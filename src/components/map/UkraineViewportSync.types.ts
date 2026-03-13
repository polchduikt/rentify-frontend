import type { SearchMapBounds } from '@/types/search';

export interface UkraineViewportSyncProps {
  onBoundsChange: (bounds: SearchMapBounds) => void;
  onMapClick?: () => void;
}
