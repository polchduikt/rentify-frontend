import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PropertyDetailsMainSections, PropertyDetailsSidebar } from '@/components/property-details';
import { ROUTES } from '@/config/routes';
import { usePropertyDetailsPage } from '@/hooks';

const INVALID_ID_TEXT = '\u041d\u0435\u043a\u043e\u0440\u0435\u043a\u0442\u043d\u0438\u0439 ID \u043e\u0433\u043e\u043b\u043e\u0448\u0435\u043d\u043d\u044f.';
const SHORT_TERM_BADGE = '\u041e\u043a\u0440\u0435\u043c\u0430 \u0441\u0442\u043e\u0440\u0456\u043d\u043a\u0430';
const SHORT_TERM_TITLE =
  '\u0414\u043b\u044f \u043f\u043e\u0434\u043e\u0431\u043e\u0432\u043e\u0457 \u043e\u0440\u0435\u043d\u0434\u0438 \u0431\u0443\u0434\u0435 \u043e\u043a\u0440\u0435\u043c\u0438\u0439 \u0434\u0435\u0442\u0430\u043b\u044c\u043d\u0438\u0439 \u0448\u0430\u0431\u043b\u043e\u043d';
const SHORT_TERM_DESCRIPTION =
  '\u0426\u0435 \u043e\u0433\u043e\u043b\u043e\u0448\u0435\u043d\u043d\u044f \u043a\u043e\u0440\u043e\u0442\u043a\u043e\u0441\u0442\u0440\u043e\u043a\u043e\u0432\u043e\u0457 \u043e\u0440\u0435\u043d\u0434\u0438. \u0414\u0435\u0442\u0430\u043b\u044c\u043d\u0430 \u0441\u0442\u043e\u0440\u0456\u043d\u043a\u0430 \u0434\u043b\u044f \u0442\u0430\u043a\u043e\u0433\u043e \u0442\u0438\u043f\u0443 \u0431\u0443\u0434\u0435 \u0440\u0435\u0430\u043b\u0456\u0437\u043e\u0432\u0430\u043d\u0430 \u043e\u043a\u0440\u0435\u043c\u043e.';
const BACK_TO_SEARCH_TEXT = '\u041f\u043e\u0432\u0435\u0440\u043d\u0443\u0442\u0438\u0441\u044f \u0434\u043e \u043f\u043e\u0448\u0443\u043a\u0443';
const BACK_TO_LIST_TEXT = '\u0414\u043e \u0441\u043f\u0438\u0441\u043a\u0443 \u043e\u0433\u043e\u043b\u043e\u0448\u0435\u043d\u044c';

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

  if (model.isShortTerm) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{SHORT_TERM_BADGE}</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{SHORT_TERM_TITLE}</h1>
          <p className="mt-2 text-slate-600">{SHORT_TERM_DESCRIPTION}</p>
          <Link
            to={ROUTES.search}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            {BACK_TO_SEARCH_TEXT}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 pb-12">
      <div className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
        <Link to={ROUTES.search} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
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

          <PropertyDetailsSidebar
            property={model.property}
            owner={model.owner}
            ownerLoading={model.ownerLoading}
            ownerName={model.ownerName}
            ownerInitial={model.ownerInitial}
            pricePerMonth={model.pricePerMonth}
            currency={model.currency}
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
