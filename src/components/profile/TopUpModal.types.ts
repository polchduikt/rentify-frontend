export interface TopUpModalProps {
  isOpen: boolean;
  currency: string;
  options: number[];
  optionsLoading: boolean;
  optionsError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
}
