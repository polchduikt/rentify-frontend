import type { PropertyResponseDto } from '@/types/property';

export interface SearchMapPropertyCardProps {
  property: PropertyResponseDto | null;
  onClose: () => void;
}
