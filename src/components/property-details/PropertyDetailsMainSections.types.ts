import type { ReactNode } from 'react';
import type { AmenityDto, PropertyResponseDto } from '@/types/property';

export interface PropertyDetailsMainSectionsProps {
  property: PropertyResponseDto;
  activePhoto: string;
  photos: string[];
  activePhotoIndex: number;
  onPhotoSelect: (index: number) => void;
  city: string;
  addressLine: string;
  groupedAmenities: Array<{ category: string; amenities: AmenityDto[] }>;
  mapCenter: [number, number];
  hasExactMapCoords: boolean;
  mapCoordsLoading: boolean;
  recommendationsLoading: boolean;
  recommendedVisible: PropertyResponseDto[];
  canSlidePrev: boolean;
  canSlideNext: boolean;
  onSlidePrev: () => void;
  onSlideNext: () => void;
  isFavorite?: boolean;
  favoriteIds?: Set<number>;
  shortTermBookingSection?: ReactNode;
  shortTermReviewsSection?: ReactNode;
}
