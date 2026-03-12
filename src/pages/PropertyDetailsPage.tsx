import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PropertyDetailsMainSections,
  PropertyDetailsSidebar,
  PropertyShortTermBookingSidebar,
} from '@/components/property-details';
import { ROUTES } from '@/config/routes';
import { usePropertyDetailsPage } from '@/hooks';

const INVALID_ID_TEXT = 'Некоректний ID оголошення.';
const BACK_TO_LIST_TEXT = 'До списку оголошень';

const PropertyDetailsPage = () => {
  const model = usePropertyDetailsPage();

  if (!model.isValidId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{INVALID_ID_TEXT}</div>
      </div>
    );
  }

  if (model.isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-[420px] animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-52 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );
  }

  if (model.hasPropertyError || !model.property) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{model.errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 pb-12">
      <div className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          to={ROUTES.search}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          {BACK_TO_LIST_TEXT}
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <PropertyDetailsMainSections
            property={model.property}
            activePhoto={model.activePhoto}
            photos={model.photos}
            activePhotoIndex={model.activePhotoIndex}
            onPhotoSelect={model.selectPhoto}
            city={model.city}
            addressLine={model.addressLine}
            groupedAmenities={model.groupedAmenities}
            mapCenter={model.mapCenter}
            hasExactMapCoords={model.hasExactMapCoords}
            mapCoordsLoading={model.mapCoordsLoading}
            recommendationsLoading={model.recommendationsLoading}
            recommendedVisible={model.recommendedVisible}
            canSlidePrev={model.canSlidePrev}
            canSlideNext={model.canSlideNext}
            onSlidePrev={model.slideRecommendationsPrev}
            onSlideNext={model.slideRecommendationsNext}
            isFavorite={model.isFavorite}
            favoriteIds={model.favoriteIds}
          />

          {model.isShortTerm ? (
            <PropertyShortTermBookingSidebar
              property={model.property}
              owner={model.owner}
              ownerLoading={model.ownerLoading}
              ownerName={model.ownerName}
              ownerInitial={model.ownerInitial}
            />
          ) : (
            <PropertyDetailsSidebar
              property={model.property}
              owner={model.owner}
              ownerLoading={model.ownerLoading}
              ownerName={model.ownerName}
              ownerInitial={model.ownerInitial}
              pricePerMonth={model.pricePerMonth}
              currency={model.currency}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
