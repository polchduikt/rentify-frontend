import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchFiltersPanel } from '@/components/search/SearchFiltersPanel';
import { SearchResultsSection } from '@/components/search/SearchResultsSection';
import { ROUTES } from '@/config/routes';
import { useSearchPage } from '@/hooks';

const SearchPage = () => {
  const model = useSearchPage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (model.viewMode === 'map') {
      model.setViewMode('single');
    }
  }, [model.viewMode]);

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      <SearchFiltersPanel
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

      <SearchResultsSection
        loading={model.loading}
        error={model.error}
        filtered={model.filtered}
        visibleItems={model.visibleItems}
        viewMode={model.viewMode}
        mapPinsLoading={model.mapPinsLoading}
        mapPinsError={model.mapPinsError}
        mapPins={model.mapPins}
        selectedMapPropertyId={model.selectedMapPropertyId}
        selectedMapProperty={model.selectedMapProperty}
        currentPage={model.currentPage}
        totalPages={model.totalPages}
        visibleCount={model.visibleCount}
        paginationItems={model.paginationItems}
        onViewModeChange={model.setViewMode}
        onOpenMapPage={() => {
          navigate(`${ROUTES.searchMap}${location.search}`);
        }}
        onMapPropertySelect={model.setSelectedMapPropertyId}
        onMapBoundsChange={model.handleMapBoundsChange}
        onShowMore={model.showMore}
        onPrevPage={model.goPrevPage}
        onNextPage={model.goNextPage}
        onPageChange={model.goToPage}
      />
    </div>
  );
};

export default SearchPage;
