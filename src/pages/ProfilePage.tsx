import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AccountSection,
  ChatSection,
  EmptySection,
  FavoritesSection,
  ProfileHero,
  ProfileSidebarNav,
  PropertiesSection,
  SecuritySection,
  TransactionsSection,
} from '@/components/profile';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { useProfilePage } from '@/hooks';
import { useProfileNavigation } from '@/hooks/profile';
import { resolveAvatarUrl } from '@/utils/avatar';

const ProfilePage = () => {
  const model = useProfilePage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const navigation = useProfileNavigation({ properties: model.properties });
  const avatarSrc = useMemo(() => resolveAvatarUrl(model.profile?.avatarUrl), [model.profile?.avatarUrl]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarSrc]);

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

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void model.saveProfile();
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void model.changePassword();
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login);
  };

  return (
    <div className="bg-[radial-gradient(circle_at_top,#e0ecff,transparent_44%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] pb-14">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProfileHero
          avatarSrc={avatarSrc}
          avatarLoadFailed={avatarLoadFailed}
          onAvatarError={() => setAvatarLoadFailed(true)}
          initials={model.initials}
          fullName={model.fullName}
          email={model.profile.email}
          createdAt={model.profile.createdAt}
          walletBalance={model.walletBalance}
          walletCurrency={model.walletCurrency}
          propertiesCount={model.propertiesCount}
          activePropertiesInPreview={model.activePropertiesInPreview}
          favoritesCount={model.favoritesCount}
          bookingsCount={model.bookingsCount}
          promotedPropertiesInPreview={model.promotedPropertiesInPreview}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ProfileSidebarNav
            activeSection={navigation.activeSection}
            isPropertiesOpen={navigation.isPropertiesOpen}
            isSettingsOpen={navigation.isSettingsOpen}
            onToggleProperties={navigation.togglePropertiesOpen}
            onToggleSettings={navigation.toggleSettingsOpen}
            onSelectSection={navigation.setActiveSection}
            onLogout={handleLogout}
          />

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
                onAvatarUpload={(file) => void model.uploadAvatar(file)}
                onAvatarDelete={() => void model.deleteAvatar()}
                onProfileFieldChange={model.setProfileField}
                onSubmit={handleProfileSubmit}
                onReset={model.resetProfileForm}
              />
            ) : null}

            {navigation.activeSection === 'security' ? (
              <SecuritySection
                passwordForm={model.passwordForm}
                passwordNotice={model.passwordNotice}
                passwordSaving={model.passwordSaving}
                onPasswordFieldChange={model.setPasswordField}
                onSubmit={handlePasswordSubmit}
              />
            ) : null}

            {navigation.activeSection === 'chat' ? <ChatSection /> : null}

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

            {navigation.isPropertiesSection ? (
              <PropertiesSection
                title={navigation.propertiesTabTitle}
                properties={navigation.propertiesForActiveTab}
                propertiesLoading={model.propertiesLoading}
                propertiesError={model.propertiesError}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
