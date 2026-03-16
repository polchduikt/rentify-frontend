import type { PropertyResponseDto } from '@/types/property';

export interface PropertiesSectionProps {
  title: string;
  properties: PropertyResponseDto[];
  propertiesLoading: boolean;
  propertiesError: string | null;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}
