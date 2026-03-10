import type { LocationSuggestionType } from './enums';

export interface LocationSuggestionDto {
  id: number;
  type: LocationSuggestionType;
  name: string;
  cityId: number;
  cityName: string;
  region: string;
  country: string;
}
