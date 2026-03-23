import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  PropertyDetailsMainSections,
  PropertyDetailsSidebar,
  PropertyShortTermPlanningSection,
  PropertyShortTermBookingSidebar,
  PropertyShortTermReviewsSection,
} from '@/components/property-details';
import { openChatWidget } from '@/components/chat';
import { PROPERTY_DETAILS_BACK_TO_LIST_TEXT, PROPERTY_DETAILS_INVALID_ID_TEXT } from '@/constants/propertyDetailsPage';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyDetailsPage } from '@/hooks';

const PropertyDetailsPage = () => {
  const model = usePropertyDetailsPage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOwnerPhoneVisible, setIsOwnerPhoneVisible] = useState(false);
  const propertyId = model.property?.id ?? null;

  useEffect(() => {
    if (propertyId == null) {
      return;
    }
    setIsOwnerPhoneVisible(false);
  }, [propertyId]);

  const handleContactHost = () => {
    if (!model.property) {
      return;
    }
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } });
      return;
    }
    openChatWidget({
      propertyId: model.property.id,
      initialText: `Доброго дня! Цікавить оголошення "${model.property.title}".`,
    });
  };

  const handleShowOwnerPhone = () => {
    if (!model.ownerPhone) {
      return;
    }
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location } });
      return;
    }
    setIsOwnerPhoneVisible(true);
  };

  if (!model.isValidId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{PROPERTY_DETAILS_INVALID_ID_TEXT}</div>
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
          {PROPERTY_DETAILS_BACK_TO_LIST_TEXT}
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
            shortTermBookingSection={
              model.isShortTerm ? (
                <PropertyShortTermPlanningSection
                  dateFrom={model.bookingDateFrom}
                  dateTo={model.bookingDateTo}
                  guests={model.bookingGuests}
                  maxGuests={model.bookingMaxGuests}
                  todayIso={model.bookingTodayIso}
                  maxDateIso={model.bookingMaxDateIso}
                  nightlyPrice={model.shortTermNightlyPrice}
                  currency={model.shortTermCurrency}
                  unavailableRanges={model.bookingUnavailableRanges}
                  onDateFromChange={model.setBookingDateFrom}
                  onDateToChange={model.setBookingDateTo}
                />
              ) : null
            }
            shortTermReviewsSection={
              model.isShortTerm ? (
                <PropertyShortTermReviewsSection
                  reviews={model.propertyReviews}
                  reviewsLoading={model.propertyReviewsLoading}
                  reviewsError={model.propertyReviewsError}
                  canLeaveReview={model.canLeaveShortTermReview}
                  reviewHint={model.shortTermReviewHint}
                  pendingReviewBookingId={model.pendingReviewBookingId}
                  pendingReviewBookingDateTo={model.pendingReviewBookingDateTo}
                  isSubmittingReview={model.createShortTermReviewPending}
                  onSubmitReview={model.createShortTermReview}
                />
              ) : null
            }
          />

          {model.isShortTerm ? (
            <PropertyShortTermBookingSidebar
              property={model.property}
              dateFrom={model.bookingDateFrom}
              dateTo={model.bookingDateTo}
              guests={model.bookingGuests}
              maxGuests={model.bookingMaxGuests}
              todayIso={model.bookingTodayIso}
              maxDateIso={model.bookingMaxDateIso}
              nightlyPrice={model.shortTermNightlyPrice}
              currency={model.shortTermCurrency}
              unavailableRanges={model.bookingUnavailableRanges}
              unavailableLoading={model.bookingUnavailableLoading}
              owner={model.owner}
              ownerLoading={model.ownerLoading}
              ownerName={model.ownerName}
              ownerInitial={model.ownerInitial}
              ownerPhone={model.ownerPhone}
              isPhoneVisible={isOwnerPhoneVisible}
              onDateFromChange={model.setBookingDateFrom}
              onDateToChange={model.setBookingDateTo}
              onGuestsChange={model.setBookingGuests}
              onContactHost={handleContactHost}
              onShowPhone={handleShowOwnerPhone}
              disableContactHost={model.isOwnProperty}
            />
          ) : (
            <PropertyDetailsSidebar
              property={model.property}
              owner={model.owner}
              ownerLoading={model.ownerLoading}
              ownerName={model.ownerName}
              ownerInitial={model.ownerInitial}
              ownerPhone={model.ownerPhone}
              isPhoneVisible={isOwnerPhoneVisible}
              onContactHost={handleContactHost}
              onShowPhone={handleShowOwnerPhone}
              disableContactHost={model.isOwnProperty}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;
