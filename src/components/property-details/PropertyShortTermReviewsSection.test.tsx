import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReviewDto } from '@/types/review';
import { PropertyShortTermReviewsSection } from './PropertyShortTermReviewsSection';

const makeReview = (overrides: Partial<ReviewDto> = {}): ReviewDto => ({
  id: 1,
  propertyId: 101,
  bookingId: 501,
  authorId: 8,
  rating: 5,
  authorFirstName: 'Olena',
  comment: 'Great stay',
  createdAt: '2026-03-10T12:00:00Z',
  ...overrides,
});

const renderSection = (overrides: Partial<React.ComponentProps<typeof PropertyShortTermReviewsSection>> = {}) => {
  const onSubmitReview = vi.fn().mockResolvedValue(undefined);
  const props: React.ComponentProps<typeof PropertyShortTermReviewsSection> = {
    reviews: [],
    reviewsLoading: false,
    reviewsError: null,
    canLeaveReview: true,
    reviewHint: null,
    pendingReviewBookingId: null,
    pendingReviewBookingDateTo: null,
    isSubmittingReview: false,
    onSubmitReview,
    ...overrides,
  };

  const view = render(<PropertyShortTermReviewsSection {...props} />);
  return { ...view, onSubmitReview };
};

describe('PropertyShortTermReviewsSection', () => {
  it('renders existing reviews with average rating', () => {
    renderSection({
      reviews: [makeReview({ id: 1, rating: 4 }), makeReview({ id: 2, rating: 2, authorFirstName: 'Ivan' })],
    });

    expect(screen.getByText('Olena')).toBeInTheDocument();
    expect(screen.getByText('Ivan')).toBeInTheDocument();
    expect(screen.getByText(/3\.0/)).toBeInTheDocument();
  });

  it('submits review with selected rating and trimmed comment', async () => {
    const user = userEvent.setup();
    const { onSubmitReview, container } = renderSection();

    const commentBox = screen.getByRole('textbox');
    await user.type(commentBox, '  Loved it  ');
    await user.click(screen.getByRole('button', { name: /4/ }));

    const submitButton = container.querySelector('button[type="submit"]');
    if (!submitButton) {
      throw new Error('Submit button not found');
    }
    await user.click(submitButton);

    expect(onSubmitReview).toHaveBeenCalledWith({ rating: 4, comment: 'Loved it' });
    expect(commentBox).toHaveValue('');
  });

  it('shows review hint and hides form when user cannot leave review', () => {
    const { container } = renderSection({
      canLeaveReview: false,
      reviewHint: 'Complete your stay first',
    });

    expect(screen.getByText('Complete your stay first')).toBeInTheDocument();
    expect(container.querySelector('button[type="submit"]')).toBeNull();
  });
});
