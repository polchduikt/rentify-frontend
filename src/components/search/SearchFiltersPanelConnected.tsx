import type { SearchPageModel } from '@/hooks/search';
import { SearchFiltersPanel } from './SearchFiltersPanel';
import type { SearchFiltersPanelProps } from './SearchFiltersPanel.types';

interface SearchFiltersPanelConnectedProps {
  model: SearchPageModel;
  mode?: SearchFiltersPanelProps['mode'];
  mapFormAction?: SearchFiltersPanelProps['mapFormAction'];
}

export const SearchFiltersPanelConnected = ({ model, mode, mapFormAction }: SearchFiltersPanelConnectedProps) => (
  <SearchFiltersPanel
    mode={mode}
    mapFormAction={mapFormAction}
    cityInput={model.cityInput}
    rentalType={model.rentalType}
    priceFrom={model.priceFrom}
    priceTo={model.priceTo}
    roomsMin={model.roomsMin}
    roomsMax={model.roomsMax}
    areaFrom={model.areaFrom}
    areaTo={model.areaTo}
    extra={model.extra}
    sortMode={model.sortMode}
    extraCount={model.extraCount}
    filteredCount={model.filtered.length}
    suggestions={model.suggestions}
    suggestionsLoading={model.suggestionsLoading}
    amenitiesGrouped={model.amenitiesGrouped}
    amenitiesLoading={model.amenitiesLoading}
    onCityInputChange={model.setCityInput}
    onLocationSuggestionSelect={model.handleLocationSuggestionSelect}
    onRentalTypeChange={model.handleRentalTypeChange}
    onPriceFromChange={model.setPriceFrom}
    onPriceToChange={model.setPriceTo}
    onRoomsSelect={model.handleRoomsSelect}
    onRoomsMaxChange={model.setRoomsMax}
    onAreaFromChange={model.setAreaFrom}
    onAreaToChange={model.setAreaTo}
    onExtraDraftChange={model.handleExtraDraftChange}
    onExtraImmediateChange={model.handleExtraImmediateChange}
    onAmenitySlugToggle={model.handleAmenitySlugToggle}
    onAmenityCategoryToggle={model.handleAmenityCategoryToggle}
    onSortModeChange={model.handleSortModeChange}
    onCommitFilters={model.handleFiltersCommit}
    onResetAllFilters={model.handleResetAllFilters}
  />
);

