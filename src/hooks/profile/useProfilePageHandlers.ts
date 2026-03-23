import { useCallback, useMemo, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import type { NavigationSection } from '@/types/profile';
import type { ProfilePageModel } from './useProfilePage';

interface ProfileNavigationState {
  activeSection: NavigationSection | null;
  propertiesForActiveTab: ProfilePageModel['properties'];
}

interface UseProfilePageHandlersParams {
  model: ProfilePageModel;
  navigation: ProfileNavigationState;
  logout: () => void;
  navigate: NavigateFunction;
  setIsTopUpModalOpen: Dispatch<SetStateAction<boolean>>;
}

const logAsyncError = (context: string, error: unknown) => {
  console.error(context, error);
};

export const useProfilePageHandlers = ({
  model,
  navigation,
  logout,
  navigate,
  setIsTopUpModalOpen,
}: UseProfilePageHandlersParams) => {
  const {
    saveProfile,
    changePassword,
    deleteAccount,
    topUpWallet,
    uploadAvatar,
    deleteAvatar,
    publishedProperties,
    publishedPropertiesLoading,
    propertiesLoading,
    publishedPropertiesError,
    propertiesError,
    publishedPropertiesTotalElements,
    activePropertiesInPreview,
    publishedPropertiesTotalPages,
    setPublishedPropertiesPage,
  } = model;

  const handleProfileSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      saveProfile().catch((error) => {
        logAsyncError('Failed to save profile', error);
      });
    },
    [saveProfile],
  );

  const handlePasswordSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      changePassword().catch((error) => {
        logAsyncError('Failed to change password', error);
      });
    },
    [changePassword],
  );

  const handleDeleteAccount = useCallback(async () => {
    try {
      await deleteAccount();
      logout();
      navigate(ROUTES.login, { replace: true });
    } catch (error) {
      logAsyncError('Failed to delete account', error);
    }
  }, [deleteAccount, logout, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate(ROUTES.login);
  }, [logout, navigate]);

  const handleTopUpSubmit = useCallback(
    async (amount: number) => {
      try {
        await topUpWallet(amount);
        setIsTopUpModalOpen(false);
      } catch (error) {
        logAsyncError('Failed to top up wallet', error);
      }
    },
    [setIsTopUpModalOpen, topUpWallet],
  );

  const handleAvatarUpload = useCallback(
    (file: File) => {
      uploadAvatar(file).catch((error) => {
        logAsyncError('Failed to upload avatar', error);
      });
    },
    [uploadAvatar],
  );

  const handleAvatarDelete = useCallback(() => {
    deleteAvatar().catch((error) => {
      logAsyncError('Failed to delete avatar', error);
    });
  }, [deleteAvatar]);

  const isPublishedPropertiesSection = navigation.activeSection === 'properties-published';
  const propertiesForSection = useMemo(
    () => (isPublishedPropertiesSection ? publishedProperties : navigation.propertiesForActiveTab),
    [isPublishedPropertiesSection, navigation.propertiesForActiveTab, publishedProperties],
  );
  const propertiesLoadingForSection = isPublishedPropertiesSection ? publishedPropertiesLoading : propertiesLoading;
  const propertiesErrorForSection = isPublishedPropertiesSection ? publishedPropertiesError : propertiesError;
  const publishedTotalCount = useMemo(
    () => Math.max(publishedPropertiesTotalElements, activePropertiesInPreview),
    [activePropertiesInPreview, publishedPropertiesTotalElements],
  );
  const publishedTotalPages = useMemo(
    () => Math.max(publishedPropertiesTotalPages, Math.ceil(publishedTotalCount / 10)),
    [publishedPropertiesTotalPages, publishedTotalCount],
  );
  const handlePublishedPropertiesPageChange = useCallback(
    (page: number) => {
      setPublishedPropertiesPage(Math.max(0, page - 1));
    },
    [setPublishedPropertiesPage],
  );

  return {
    handleProfileSubmit,
    handlePasswordSubmit,
    handleDeleteAccount,
    handleLogout,
    handleTopUpSubmit,
    handleAvatarUpload,
    handleAvatarDelete,
    isPublishedPropertiesSection,
    propertiesForSection,
    propertiesLoadingForSection,
    propertiesErrorForSection,
    publishedTotalCount,
    publishedTotalPages,
    handlePublishedPropertiesPageChange,
  };
};
