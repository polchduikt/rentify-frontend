import { useEffect, useRef, useState } from 'react';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonTheme = 'outline' | 'filled_blue' | 'filled_black';

interface GoogleSignInButtonProps {
  clientId: string;
  onCredential: (idToken: string) => void | Promise<void>;
  onError: (message: string) => void;
  disabled?: boolean;
  theme?: GoogleButtonTheme;
}

interface GoogleAccountsIdApi {
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

interface GoogleWindow {
  accounts: {
    id: GoogleAccountsIdApi;
  };
}

declare global {
  interface Window {
    google?: GoogleWindow;
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-script';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

const loadGoogleScript = async (): Promise<void> => {
  if (window.google?.accounts?.id) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      const onLoad = () => resolve();
      const onError = () => reject(new Error('Failed to load Google script'));

      existingScript.addEventListener('load', onLoad, { once: true });
      existingScript.addEventListener('error', onError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(script);
  });
};

const GoogleSignInButton = ({
  clientId,
  onCredential,
  onError,
  disabled = false,
  theme = 'outline',
}: GoogleSignInButtonProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    const setup = async () => {
      if (!clientId) {
        setIsReady(false);
        return;
      }

      try {
        await loadGoogleScript();
        if (!isActive || !containerRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: GoogleCredentialResponse) => {
            if (!response.credential) {
              onError('Google sign-in failed. No credential received.');
              return;
            }
            void onCredential(response.credential);
          },
        });

        containerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme,
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 360,
        });

        setIsReady(true);
      } catch {
        if (isActive) {
          setIsReady(false);
          onError('Google sign-in is temporarily unavailable.');
        }
      }
    };

    void setup();

    return () => {
      isActive = false;
    };
  }, [clientId, onCredential, onError, theme]);

  if (!clientId) {
    return (
      <p className="text-center text-xs text-slate-500">
        Google sign-in is disabled. Missing `VITE_GOOGLE_CLIENT_ID`.
      </p>
    );
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-70' : ''}>
      {!isReady && <p className="mb-2 text-center text-xs text-slate-500">Loading Google Sign-In...</p>}
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
};

export default GoogleSignInButton;
