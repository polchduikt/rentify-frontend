import { ChevronLeft, ChevronRight, Loader2, Save, Upload, X } from 'lucide-react';
import type { CreatePropertyStepActionsProps } from './CreatePropertyStepActions.types';

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
  onSaveDraft,
  onCancel,
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
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onSaveDraft ? (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            В чернетки
          </button>
        ) : null}

        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting || !isStepComplete}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          Далі
          <ChevronRight size={16} />
        </button>
      </div>
    ) : (
      <div className="flex flex-wrap items-center justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
            Скасувати
          </button>
        ) : null}

        {onSaveDraft ? (
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            В чернетки
          </button>
        ) : null}

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
      </div>
    )}
  </div>
);
