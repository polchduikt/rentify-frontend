import { LoaderCircle, Star } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { SHORT_TERM_REVIEW_DEFAULT_RATING, SHORT_TERM_REVIEW_MAX_COMMENT_LENGTH } from '@/constants/reviews';
import { getApiErrorMessage } from '@/utils/errors';
import type { PropertyShortTermReviewsSectionProps } from './PropertyShortTermReviewsSection.types';

const formatReviewDate = (value?: string | null) => {
  if (!value) {
    return 'Нещодавно';
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Нещодавно';
  }

  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

export const PropertyShortTermReviewsSection = ({
  reviews,
  reviewsLoading,
  reviewsError,
  canLeaveReview,
  reviewHint,
  pendingReviewBookingId,
  pendingReviewBookingDateTo,
  isSubmittingReview,
  onSubmitReview,
}: PropertyShortTermReviewsSectionProps) => {
  const [rating, setRating] = useState(SHORT_TERM_REVIEW_DEFAULT_RATING);
  const [comment, setComment] = useState('');
  const [submitNotice, setSubmitNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return null;
    }

    const totalRating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return totalRating / reviews.length;
  }, [reviews]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitNotice(null);

    const normalizedRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 0)));
    if (!Number.isFinite(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      setSubmitNotice({
        type: 'error',
        message: 'Оцініть проживання за шкалою від 1 до 5.',
      });
      return;
    }

    try {
      await onSubmitReview({
        rating: normalizedRating,
        comment: comment.trim() ? comment.trim() : undefined,
      });
      setComment('');
      setRating(SHORT_TERM_REVIEW_DEFAULT_RATING);
      setSubmitNotice({
        type: 'success',
        message: 'Дякуємо, ваш відгук опубліковано.',
      });
    } catch (error) {
      setSubmitNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося зберегти відгук. Спробуйте ще раз.'),
      });
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Відгуки гостей</h2>
          <p className="mt-1 text-sm text-slate-500">Лише для короткострокової оренди після завершеного виїзду.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">
            {reviews.length} {reviews.length === 1 ? 'відгук' : reviews.length < 5 ? 'відгуки' : 'відгуків'}
          </p>
          {averageRating != null ? (
            <p className="text-xs text-amber-700">Середня оцінка: {averageRating.toFixed(1)} / 5</p>
          ) : null}
        </div>
      </div>

      {reviewsError ? (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{reviewsError}</p>
      ) : null}

      {reviewsLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">
          Поки що немає відгуків для цього оголошення.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{review.authorFirstName || 'Користувач'}</p>
                <p className="text-xs text-slate-500">{formatReviewDate(review.createdAt)}</p>
              </div>
              <p className="mt-2 text-sm font-semibold text-amber-700">
                {'★'.repeat(Math.max(1, Math.min(5, Number(review.rating) || 0)))}
                {'☆'.repeat(5 - Math.max(1, Math.min(5, Number(review.rating) || 0)))}
              </p>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-slate-700">
                {review.comment?.trim() || 'Без текстового коментаря.'}
              </p>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 border-t border-slate-200 pt-6">
        <h3 className="text-base font-bold text-slate-900">Залишити відгук</h3>
        {canLeaveReview ? (
          <form className="mt-3 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
            {pendingReviewBookingId ? (
              <p className="text-xs text-slate-500">
                Бронювання #{pendingReviewBookingId}
                {pendingReviewBookingDateTo ? `, виїзд: ${formatReviewDate(pendingReviewBookingDateTo)}` : ''}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setRating(value);
                    setSubmitNotice(null);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-amber-500 hover:bg-amber-50"
                  aria-label={`Оцінка ${value}`}
                >
                  <Star size={16} fill={value <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Коментар (необов’язково)</span>
              <textarea
                value={comment}
                maxLength={SHORT_TERM_REVIEW_MAX_COMMENT_LENGTH}
                onChange={(event) => {
                  setComment(event.target.value);
                  setSubmitNotice(null);
                }}
                placeholder="Поділіться враженнями про проживання..."
                className="min-h-[110px] w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <span className="block text-right text-[11px] text-slate-500">
                {comment.length}/{SHORT_TERM_REVIEW_MAX_COMMENT_LENGTH}
              </span>
            </label>

            {submitNotice ? (
              <p
                className={`rounded-xl border px-3 py-2 text-sm ${
                  submitNotice.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {submitNotice.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmittingReview ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {isSubmittingReview ? 'Зберігаю...' : 'Опублікувати відгук'}
            </button>
          </form>
        ) : (
          <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {reviewHint || 'Щоб залишити відгук, потрібне завершене бронювання цієї пропозиції.'}
          </p>
        )}
      </div>
    </section>
  );
};
