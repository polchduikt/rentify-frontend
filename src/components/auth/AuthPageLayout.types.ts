import type { ReactNode } from 'react';

export interface AuthPageLayoutProps {
  photoUrl: string;
  imageAlt: string;
  overlayClassName: string;
  leftEyebrow: string;
  leftTitle: string;
  leftContent: ReactNode;
  rightContent: ReactNode;
}
