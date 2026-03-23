import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileSidebarNav } from '@/components/profile/ProfileSidebarNav';
import { openChatWidget } from '@/components/chat';
import { PROFILE_PAGE_SECTION_SET } from '@/constants/profilePage';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfilePage } from '@/hooks';
import { useProfileNavigation, useProfilePageHandlers } from '@/hooks/profile';
import type { NavigationSection } from '@/types/profile';
import { resolveAvatarUrl } from '@/utils/avatar';

const AccountSection = lazy(() =>
  import('@/components/profile/sections/AccountSection').then((module) => ({ default: module.AccountSection }))
);
const BookingsSection = lazy(() =>
  import('@/components/profile/sections/BookingsSection').then((module) => ({ default: module.BookingsSection }))
);
const EmptySection = lazy(() =>
  import('@/components/profile/sections/EmptySection').then((module) => ({ default: module.EmptySection }))
);
const FavoritesSection = lazy(() =>
  import('@/components/profile/sections/FavoritesSection').then((module) => ({ default: module.FavoritesSection }))
);
const PromotionsSection = lazy(() =>
  import('@/components/profile/sections/PromotionsSection').then((module) => ({ default: module.PromotionsSection }))
);
const PropertiesSection = lazy(() =>
  import('@/components/profile/sections/PropertiesSection').then((module) => ({ default: module.PropertiesSection }))
);
const SecuritySection = lazy(() =>
  import('@/components/profile/sections/SecuritySection').then((module) => ({ default: module.SecuritySection }))
);
const TransactionsSection = lazy(() =>
  import('@/components/profile/sections/TransactionsSection').then((module) => ({ default: module.TransactionsSection }))
);
const TopUpModal = lazy(() =>
  import('@/components/profile/TopUpModal').then((module) => ({ default: module.TopUpModal }))
);

const SECTION_FALLBACK = (
  <div className="space-y-4">
    <div className="h-10 w-48 animate-pulse rounded-2xl bg-white/70" />
    <div className="h-40 animate-pulse rounded-3xl bg-white/70" />
    <div className="h-56 animate-pulse rounded-3xl bg-white/70" />
  </div>
);

const ProfilePage = () => {
  const model = useProfilePage();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const sectionFromQuery = searchParams.get('section');
  const initialSection =
    sectionFromQuery && PROFILE_PAGE_SECTION_SET.has(sectionFromQuery as NavigationSection)
      ? (sectionFromQuery as NavigationSection)
      : null;

  const navigation = useProfileNavigation({ properties: model.properties, initialSection });
  const handlers = useProfilePageHandlers({
    model,
    navigation,
    logout,
    navigate,
    setIsTopUpModalOpen,
  });
  const avatarSrc = useMemo(() => resolveAvatarUrl(model.profile?.avatarUrl), [model.profile?.avatarUrl]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarSrc]);

  useEffect(() => {
    if (sectionFromQuery !== 'chat') {
      return;
    }
    openChatWidget({});
  }, [sectionFromQuery]);

  if (model.isInitialLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );
  }

  if (model.criticalError || !model.profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {model.criticalError || 'Не вдалося завантажити профіль.'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`profile-page-shell pb-14 ${
        theme === 'dark'
          ? 'bg-[radial-gradient(circle_at_top,#1e293b,transparent_50%),linear-gradient(180deg,#020617_0%,#0b1120_100%)]'
          : 'bg-[radial-gradient(circle_at_top,#e0ecff,transparent_44%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProfileHero
          avatarSrc={avatarSrc}
          avatarLoadFailed={avatarLoadFailed}
          onAvatarError={() => setAvatarLoadFailed(true)}
          initials={model.initials}
          fullName={model.fullName}
          email={model.profile.email ?? ''}
          createdAt={model.profile.createdAt}
          walletBalance={model.walletBalance}
          walletCurrency={model.walletCurrency}
          propertiesCount={model.propertiesCount}
          activePropertiesInPreview={model.activePropertiesInPreview}
          favoritesCount={model.favoritesCount}
          bookingsCount={model.bookingsCount}
          paidBookingsCount={model.paidBookingsCount}
          walletTopUpPending={model.walletTopUpPending}
          onWalletTopUp={() => setIsTopUpModalOpen(true)}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ProfileSidebarNav
            activeSection={navigation.activeSection}
            isPropertiesOpen={navigation.isPropertiesOpen}
            isBookingsOpen={navigation.isBookingsOpen}
            isPromotionsOpen={navigation.isPromotionsOpen}
            isSettingsOpen={navigation.isSettingsOpen}
            onToggleProperties={navigation.togglePropertiesOpen}
            onToggleBookings={navigation.toggleBookingsOpen}
            onTogglePromotions={navigation.togglePromotionsOpen}
            onToggleSettings={navigation.toggleSettingsOpen}
            onSelectSection={navigation.setActiveSection}
            onOpenChat={() => openChatWidget({})}
            onLogout={handlers.handleLogout}
          />

          <Suspense fallback={SECTION_FALLBACK}>
            <div className="space-y-6">
              {navigation.activeSection == null ? <EmptySection /> : null}

              {navigation.activeSection === 'account' ? (
                <AccountSection
                  profile={model.profile}
                  fullName={model.fullName}
                  initials={model.initials}
                  avatarSrc={avatarSrc}
                  avatarLoadFailed={avatarLoadFailed}
                  onAvatarError={() => setAvatarLoadFailed(true)}
                  avatarUploading={model.avatarUploading}
                  avatarDeleting={model.avatarDeleting}
                  avatarNotice={model.avatarNotice}
                  profileNotice={model.profileNotice}
                  profileForm={model.profileForm}
                  isProfileDirty={model.isProfileDirty}
                  profileSaving={model.profileSaving}
                  onAvatarUpload={handlers.handleAvatarUpload}
                  onAvatarDelete={handlers.handleAvatarDelete}
                  onProfileFieldChange={model.setProfileField}
                  onSubmit={handlers.handleProfileSubmit}
                  onReset={model.resetProfileForm}
                />
              ) : null}

              {navigation.activeSection === 'security' ? (
                <SecuritySection
                  passwordForm={model.passwordForm}
                  passwordNotice={model.passwordNotice}
                  passwordSaving={model.passwordSaving}
                  accountDeleting={model.accountDeleting}
                  onPasswordFieldChange={model.setPasswordField}
                  onSubmit={handlers.handlePasswordSubmit}
                  onDeleteAccount={handlers.handleDeleteAccount}
                />
              ) : null}

              {navigation.activeSection === 'favorites' ? (
                <FavoritesSection
                  favorites={model.favorites}
                  favoritesCount={model.favoritesCount}
                  favoritesLoading={model.favoritesLoading}
                  favoritesError={model.favoritesError}
                />
              ) : null}

              {navigation.activeSection === 'payments' ? (
                <TransactionsSection
                  transactions={model.transactions}
                  transactionsLoading={model.transactionsLoading}
                  transactionsError={model.transactionsError}
                />
              ) : null}

              {navigation.isPromotionsSection ? (
                <PromotionsSection
                  mode={navigation.activeSection === 'promotions-subscriptions' ? 'promotions-subscriptions' : 'promotions-top'}
                  properties={model.propertiesForPromotions}
                  propertiesLoading={model.propertiesForPromotionsLoading}
                  propertiesError={model.propertiesForPromotionsError}
                  walletBalance={model.walletBalance}
                  walletCurrency={model.walletCurrency}
                  subscriptionPlan={model.subscriptionPlan}
                  subscriptionActiveUntil={model.subscriptionActiveUntil}
                />
              ) : null}

              {navigation.isBookingsSection ? (
                <BookingsSection
                  mode={navigation.activeSection === 'bookings-incoming' ? 'bookings-incoming' : 'bookings-my'}
                  myBookings={model.myBookings}
                  incomingBookings={model.incomingBookings}
                  myBookingsCount={model.myBookingsCount}
                  incomingBookingsCount={model.incomingBookingsCount}
                  paymentStatusByBookingId={model.paymentStatusByBookingId}
                  myBookingsLoading={model.myBookingsLoading}
                  incomingBookingsLoading={model.incomingBookingsLoading}
                  myBookingsError={model.myBookingsError}
                  incomingBookingsError={model.incomingBookingsError}
                  paymentsForBookingsError={model.paymentsForBookingsError}
                  bookingsNotice={model.bookingsNotice}
                  isActionPending={model.isBookingActionPending}
                  onCancelBooking={model.cancelBooking}
                  onConfirmIncomingBooking={model.confirmIncomingBooking}
                  onRejectIncomingBooking={model.rejectIncomingBooking}
                />
              ) : null}

              {navigation.isPropertiesSection ? (
                <PropertiesSection
                  title={navigation.propertiesTabTitle}
                  properties={handlers.propertiesForSection}
                  propertiesLoading={handlers.propertiesLoadingForSection}
                  propertiesError={handlers.propertiesErrorForSection}
                  totalCount={
                    handlers.isPublishedPropertiesSection
                      ? handlers.publishedTotalCount
                      : navigation.propertiesForActiveTab.length
                  }
                  currentPage={handlers.isPublishedPropertiesSection ? model.publishedPropertiesPage + 1 : undefined}
                  totalPages={handlers.isPublishedPropertiesSection ? handlers.publishedTotalPages : undefined}
                  pageSize={handlers.isPublishedPropertiesSection ? 10 : undefined}
                  onPageChange={
                    handlers.isPublishedPropertiesSection
                      ? handlers.handlePublishedPropertiesPageChange
                      : undefined
                  }
                />
              ) : null}
            </div>
          </Suspense>
        </div>
      </div>
      <Suspense fallback={null}>
        <TopUpModal
          isOpen={isTopUpModalOpen}
          currency={model.walletCurrency}
          options={model.topUpOptions}
          optionsLoading={model.topUpOptionsLoading}
          optionsError={model.topUpOptionsError}
          isSubmitting={model.walletTopUpPending}
          onClose={() => setIsTopUpModalOpen(false)}
          onSubmit={handlers.handleTopUpSubmit}
        />
      </Suspense>
    </div>
  );
};

export default ProfilePage;
