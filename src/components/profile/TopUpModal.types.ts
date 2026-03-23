import type { TopUpOptionDto } from '@/types/wallet';

export interface TopUpModalProps {
  isOpen: boolean;
  currency: string;
  options: TopUpOptionDto[];
  optionsLoading: boolean;
  optionsError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
}
