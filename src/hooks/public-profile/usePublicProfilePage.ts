import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAllPropertiesQuery, usePublicProfileQuery, useSearchPropertiesQuery } from '@/hooks/api';
import {
  formatJoinedAt,
  maskPhone,
  resolveDisplayName,
  resolveInitials,
  resolvePhone,
  toPositiveId,
} from '@/services/adapters/publicProfileAdapter';
import { getApiErrorMessage } from '@/utils/errors';
import { resolveAvatarUrl } from '@/utils/avatar';

const PUBLIC_PROPERTIES_PAGE_SIZE = 24;
const PROFILE_ERROR_MESSAGE = 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РїСѓР±Р»С–С‡РЅРёР№ РїСЂРѕС„С–Р»СЊ.';
const PROPERTIES_ERROR_MESSAGE = 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РѕРіРѕР»РѕС€РµРЅРЅСЏ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°.';

export const usePublicProfilePage = () => {
  const { user } = useAuth();
  const { userId } = useParams<{ userId: string }>();
  const numericUserId = toPositiveId(userId);
  const isValidUserId = numericUserId != null;

  const profileQuery = usePublicProfileQuery(numericUserId ?? 0, isValidUserId);
  const propertiesQuery = useSearchPropertiesQuery(
    {
      hostId: numericUserId ?? undefined,
    },
    { page: 0, size: PUBLIC_PROPERTIES_PAGE_SIZE, sort: 'createdAt,desc' },
    isValidUserId,
  );
  const shouldUseFallbackAllProperties =
    isValidUserId && (propertiesQuery.isError || (propertiesQuery.isFetched && (propertiesQuery.data?.content?.length ?? 0) === 0));
  const fallbackAllPropertiesQuery = useAllPropertiesQuery(
    { page: 0, size: 120, sort: 'createdAt,desc' },
    shouldUseFallbackAllProperties,
  );

  const profile = profileQuery.data ?? null;
  const searchHostProperties = useMemo(
    () => (propertiesQuery.data?.content ?? []).filter((property) => property.hostId === numericUserId),
    [numericUserId, propertiesQuery.data?.content],
  );
  const fallbackHostProperties = useMemo(
    () => (fallbackAllPropertiesQuery.data?.content ?? []).filter((property) => property.hostId === numericUserId),
    [fallbackAllPropertiesQuery.data?.content, numericUserId],
  );
  const allHostProperties = searchHostProperties.length > 0 ? searchHostProperties : fallbackHostProperties;
  const publishedProperties = useMemo(
    () => allHostProperties.filter((property) => String(property.status).toUpperCase() === 'ACTIVE'),
    [allHostProperties],
  );

  const displayedProperties = publishedProperties.length > 0 ? publishedProperties : allHostProperties;
  const displayedCount = displayedProperties.length;
  const averageRating =
    displayedCount > 0
      ? displayedProperties.reduce((sum, property) => sum + Number(property.averageRating || 0), 0) / displayedCount
      : 0;
  const totalReviews = displayedProperties.reduce((sum, property) => sum + Number(property.reviewCount || 0), 0);

  const fullName = resolveDisplayName(profile);
  const initials = resolveInitials(profile);
  const avatarUrl = resolveAvatarUrl(profile?.avatarUrl);
  const rawPhone = resolvePhone(profile);
  const maskedPhone = maskPhone(rawPhone);
  const joinedAtLabel = formatJoinedAt(profile?.createdAt);
  const firstPropertyForChat = displayedProperties[0] ?? null;

  const criticalError =
    !isValidUserId
      ? 'РќРµРєРѕСЂРµРєС‚РЅРёР№ С–РґРµРЅС‚РёС„С–РєР°С‚РѕСЂ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°.'
      : profileQuery.error
        ? getApiErrorMessage(profileQuery.error, PROFILE_ERROR_MESSAGE)
        : null;

  return {
    numericUserId,
    isValidUserId,
    isInitialLoading: isValidUserId && profileQuery.isLoading,
    criticalError,
    profile,
    fullName,
    initials,
    avatarUrl,
    joinedAtLabel,
    rawPhone,
    maskedPhone,
    allPropertiesCount: allHostProperties.length,
    activePropertiesCount: publishedProperties.length,
    displayedProperties,
    displayedCount,
    averageRating,
    totalReviews,
    propertiesLoading: propertiesQuery.isLoading || (shouldUseFallbackAllProperties && fallbackAllPropertiesQuery.isLoading),
    propertiesError:
      searchHostProperties.length === 0 && fallbackHostProperties.length === 0
        ? propertiesQuery.error
          ? getApiErrorMessage(propertiesQuery.error, PROPERTIES_ERROR_MESSAGE)
          : fallbackAllPropertiesQuery.error
            ? getApiErrorMessage(fallbackAllPropertiesQuery.error, PROPERTIES_ERROR_MESSAGE)
            : null
        : null,
    firstPropertyForChat,
    isOwnProfile: Number(user?.id ?? 0) > 0 && Number(user?.id ?? 0) === numericUserId,
  };
};

export type PublicProfilePageModel = ReturnType<typeof usePublicProfilePage>;
