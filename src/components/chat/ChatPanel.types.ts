import type { ChatOpenRequest } from '@/types/chat';
import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';

export type ChatPanelVariant = 'page' | 'widget';

export interface ChatPanelProps {
  enabled?: boolean;
  variant?: ChatPanelVariant;
  pollIntervalMs?: number;
  request?: ChatOpenRequest | null;
  onRequestHandled?: () => void;
  autoSelectFirstConversation?: boolean;
}

export interface ProfileState {
  byId: Map<number, PublicUserProfileDto>;
  isLoading: boolean;
}

export interface PropertyState {
  byId: Map<number, PropertyResponseDto>;
  isLoading: boolean;
}
