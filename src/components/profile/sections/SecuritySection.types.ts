import type { FormEvent } from 'react';
import type { PasswordFormState, SectionNotice } from '@/types/profile';

export interface SecuritySectionProps {
  passwordForm: PasswordFormState;
  passwordNotice: SectionNotice;
  passwordSaving: boolean;
  accountDeleting: boolean;
  onPasswordFieldChange: (field: keyof PasswordFormState, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteAccount: () => Promise<void>;
}
