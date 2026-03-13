export interface CreatePropertySidebarProps {
  step: number;
  stepLocks: boolean[];
  onStepClick: (nextStep: number) => void;
}
