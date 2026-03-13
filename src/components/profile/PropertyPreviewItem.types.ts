import type { PropertyResponseDto } from '@/types/property';

export interface PropertyPreviewItemProps {
  property: PropertyResponseDto;
  onDelete?: (property: PropertyResponseDto) => void;
  isDeleting?: boolean;
}
