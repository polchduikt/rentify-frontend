export type GoogleCredentialResponse = {
  credential?: string;
};

export type GoogleButtonTheme = 'outline' | 'filled_blue' | 'filled_black';

export interface GoogleSignInButtonProps {
  clientId: string;
  onCredential: (idToken: string) => void | Promise<void>;
  onError: (message: string) => void;
  disabled?: boolean;
  theme?: GoogleButtonTheme;
}

export interface GoogleAccountsIdApi {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: GoogleButtonTheme;
      size?: 'large' | 'medium' | 'small';
      type?: 'standard' | 'icon';
      text?: 'continue_with' | 'signin_with' | 'signup_with' | 'signin';
      shape?: 'rectangular' | 'pill' | 'circle' | 'square';
      width?: number;
      logo_alignment?: 'left' | 'center';
    }
  ) => void;
}

export interface GoogleWindow {
  accounts: {
    id: GoogleAccountsIdApi;
  };
}

declare global {
  interface Window {
    google?: GoogleWindow;
  }
}
