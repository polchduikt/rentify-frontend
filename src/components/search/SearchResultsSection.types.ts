import type { PropertyMapPinDto, PropertyResponseDto } from '@/types/property';
import type { SearchMapBounds, SearchPaginationItem, SearchViewMode } from '@/types/search';

export interface SearchResultsSectionProps {
  loading: boolean;
  error: string | null;
  filtered: PropertyResponseDto[];
  visibleItems: PropertyResponseDto[];
  viewMode: SearchViewMode;
  mapPinsLoading: boolean;
  mapPinsError: string | null;
  mapPins: PropertyMapPinDto[];
  selectedMapPropertyId?: number;
  selectedMapProperty: PropertyResponseDto | null;
  currentPage: number;
  totalPages: number;
  visibleCount: number;
  paginationItems: SearchPaginationItem[];
  onViewModeChange: (mode: SearchViewMode) => void;
  onOpenMapPage: () => void;
  onMapPropertySelect: (propertyId: number) => void;
  onMapBoundsChange: (bounds: SearchMapBounds) => void;
  onShowMore: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
}
