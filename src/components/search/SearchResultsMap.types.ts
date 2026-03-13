import type { PropertyMapPinDto, PropertyResponseDto } from '@/types/property';
import type { SearchMapBounds } from '@/types/search';

export interface SearchResultsMapProps {
  loading: boolean;
  pins: PropertyMapPinDto[];
  selectedPropertyId?: number;
  selectedProperty: PropertyResponseDto | null;
  onSelectProperty: (propertyId: number) => void;
  onMapBoundsChange: (bounds: SearchMapBounds) => void;
}

export interface SearchResultsMapSelectionSyncProps {
  pins: PropertyMapPinDto[];
  selectedPropertyId?: number;
}
