import { PROPERTY_CREATE_STEP_TITLES } from '@/constants/propertyCreateUi';

interface CreatePropertyStepHeaderProps {
  step: number;
}

export const CreatePropertyStepHeader = ({ step }: CreatePropertyStepHeaderProps) => (
  <div className="mb-6 border-b border-slate-200 pb-6">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Крок {step + 1}</p>
    <h2 className="mt-2 text-2xl font-bold text-slate-900">{PROPERTY_CREATE_STEP_TITLES[step]}</h2>
  </div>
);
