import type { PropertyResponseDto } from '@/types/property';

export interface PropertyPreviewItemProps {
  property: PropertyResponseDto;
  onDelete?: (property: PropertyResponseDto) => void;
  onArchive?: (property: PropertyResponseDto) => void;
  onPublish?: (property: PropertyResponseDto) => void;
  isDeleting?: boolean;
  isArchiving?: boolean;
  isPublishing?: boolean;
}
