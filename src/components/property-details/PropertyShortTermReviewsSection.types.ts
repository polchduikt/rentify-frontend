import type { LocalDateString } from '@/types/scalars';
import type { ReviewDto } from '@/types/review';

export interface PropertyShortTermReviewsSectionProps {
  reviews: ReviewDto[];
  reviewsLoading: boolean;
  reviewsError: string | null;
  canLeaveReview: boolean;
  reviewHint: string | null;
  pendingReviewBookingId: number | null;
  pendingReviewBookingDateTo: LocalDateString | null;
  isSubmittingReview: boolean;
  onSubmitReview: (payload: { rating: number; comment?: string }) => Promise<void>;
}
