import type { PropertyResponseDto } from '@/types/property';

type PropertyPromotionShape = Pick<PropertyResponseDto, 'isTopPromoted' | 'topPromotedUntil'>;

export const isTopPromotionActive = (property: PropertyPromotionShape | null | undefined): boolean => {
  if (!property?.isTopPromoted) {
    return false;
  }

  if (!property.topPromotedUntil) {
    return true;
  }

  const promotionUntilMs = new Date(property.topPromotedUntil).getTime();
  if (!Number.isFinite(promotionUntilMs)) {
    return true;
  }

  return promotionUntilMs > Date.now();
};

export const resolveTopPromotionUntilMs = (property: PropertyPromotionShape | null | undefined): number => {
  if (!property?.topPromotedUntil) {
    return 0;
  }
  const promotionUntilMs = new Date(property.topPromotedUntil).getTime();
  return Number.isFinite(promotionUntilMs) ? promotionUntilMs : 0;
};
