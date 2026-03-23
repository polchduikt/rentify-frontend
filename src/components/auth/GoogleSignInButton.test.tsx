import { render, screen, waitFor } from '@testing-library/react';
import GoogleSignInButton from './GoogleSignInButton';
import type { GoogleCredentialResponse } from './GoogleSignInButton.types';

describe('GoogleSignInButton', () => {
  afterEach(() => {
    delete window.google;
  });

  it('renders fallback notice when client id is missing', () => {
    render(<GoogleSignInButton clientId="" onCredential={vi.fn()} onError={vi.fn()} />);
    expect(screen.getByText(/VITE_GOOGLE_CLIENT_ID/)).toBeInTheDocument();
  });

  it('initializes and renders google button when api is available', async () => {
    const initializeMock = vi.fn((_config: { callback: (response: GoogleCredentialResponse) => void }) => {});
    const renderButtonMock = vi.fn();

    window.google = {
      accounts: {
        id: {
          initialize: initializeMock,
          renderButton: renderButtonMock,
        },
      },
    } as unknown as Window['google'];

    const onCredential = vi.fn();
    render(
      <GoogleSignInButton
        clientId="google-client-id"
        onCredential={onCredential}
        onError={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(initializeMock).toHaveBeenCalledTimes(1);
      expect(renderButtonMock).toHaveBeenCalledTimes(1);
    });

    expect(initializeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: 'google-client-id',
      }),
    );
    expect(renderButtonMock).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        width: 360,
        theme: 'outline',
      }),
    );

    const initializeArgs = initializeMock.mock.calls[0]?.[0] as
      | { callback: (response: GoogleCredentialResponse) => void }
      | undefined;
    if (!initializeArgs) {
      throw new Error('Google initialize args are missing');
    }
    initializeArgs.callback({ credential: 'id-token' });

    await waitFor(() => {
      expect(onCredential).toHaveBeenCalledWith('id-token');
    });
  });

  it('calls onError when google callback has no credential', async () => {
    const initializeMock = vi.fn((_config: { callback: (response: GoogleCredentialResponse) => void }) => {});

    window.google = {
      accounts: {
        id: {
          initialize: initializeMock,
          renderButton: vi.fn(),
        },
      },
    } as unknown as Window['google'];

    const onError = vi.fn();
    render(
      <GoogleSignInButton
        clientId="google-client-id"
        onCredential={vi.fn()}
        onError={onError}
      />,
    );

    await waitFor(() => expect(initializeMock).toHaveBeenCalledTimes(1));
    const initializeArgs = initializeMock.mock.calls[0]?.[0] as
      | { callback: (response: GoogleCredentialResponse) => void }
      | undefined;
    if (!initializeArgs) {
      throw new Error('Google initialize args are missing');
    }
    initializeArgs.callback({});

    expect(onError).toHaveBeenCalledTimes(1);
  });
});
