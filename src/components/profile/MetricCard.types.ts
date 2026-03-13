import type { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  actionLabel?: string;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  onAction?: () => void;
}
