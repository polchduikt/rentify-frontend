import { ChevronLeft, ChevronRight, Loader2, Upload } from 'lucide-react';

interface CreatePropertyStepActionsProps {
  canGoPrev: boolean;
  isSubmitting: boolean;
  isLastStep: boolean;
  isStepComplete: boolean;
  submitLabel?: string;
  submittingLabel?: string;
  onPrev: () => void;
  onNext: () => void;
  onPublish: () => void;
}

export const CreatePropertyStepActions = ({
  canGoPrev,
  isSubmitting,
  isLastStep,
  isStepComplete,
  submitLabel = 'Опублікувати',
  submittingLabel = 'Публікація...',
  onPrev,
  onNext,
  onPublish,
}: CreatePropertyStepActionsProps) => (
  <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
    <button
      type="button"
      onClick={onPrev}
      disabled={!canGoPrev || isSubmitting}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <ChevronLeft size={16} />
      Назад
    </button>

    {!isLastStep ? (
      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting || !isStepComplete}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
      >
        Далі
        <ChevronRight size={16} />
      </button>
    ) : (
      <button
        type="button"
        onClick={onPublish}
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {submittingLabel}
          </>
        ) : (
          <>
            <Upload size={16} />
            {submitLabel}
          </>
        )}
      </button>
    )}
  </div>
);
