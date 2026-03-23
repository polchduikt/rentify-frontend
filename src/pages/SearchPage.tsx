import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchFiltersPanelConnected } from '@/components/search/SearchFiltersPanelConnected';
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
      <SearchFiltersPanelConnected model={model} />

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
        favoriteIds={model.favoriteIds}
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
