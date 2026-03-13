import { useEffect, useRef, useState } from 'react';
import { GOOGLE_SCRIPT_ID, GOOGLE_SCRIPT_SRC } from '@/constants/auth';
import type {
  GoogleCredentialResponse,
  GoogleSignInButtonProps,
} from './GoogleSignInButton.types';

const loadGoogleScript = async (): Promise<void> => {
  if (window.google?.accounts?.id) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      const onLoad = () => resolve();
      const onError = () => reject(new Error('Не вдалося завантажити скрипт Google'));

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
    script.onerror = () => reject(new Error('Не вдалося завантажити скрипт Google'));
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
              onError('Помилка входу через Google. Не отримано credential.');
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
          onError('Вхід через Google тимчасово недоступний.');
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
        Вхід через Google вимкнено. Відсутній `VITE_GOOGLE_CLIENT_ID`.
      </p>
    );
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-70' : ''}>
      {!isReady && <p className="mb-2 text-center text-xs text-slate-500">Завантаження Google Sign-In...</p>}
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
};

export default GoogleSignInButton;
