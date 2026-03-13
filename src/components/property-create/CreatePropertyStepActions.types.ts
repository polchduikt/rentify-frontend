export interface CreatePropertyStepActionsProps {
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
