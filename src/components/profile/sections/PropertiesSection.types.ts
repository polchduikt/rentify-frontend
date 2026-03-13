import type { PropertyResponseDto } from '@/types/property';

export interface PropertiesSectionProps {
  title: string;
  properties: PropertyResponseDto[];
  propertiesLoading: boolean;
  propertiesError: string | null;
}
