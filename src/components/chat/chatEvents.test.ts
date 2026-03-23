import { CHAT_OPEN_EVENT, openChatWidget } from './chatEvents';

describe('chatEvents', () => {
  it('dispatches chat open event with request detail', () => {
    const listener = vi.fn();
    window.addEventListener(CHAT_OPEN_EVENT, listener as EventListener);

    openChatWidget({ propertyId: 42, initialText: 'Hello' });

    expect(listener).toHaveBeenCalledTimes(1);
    const [event] = listener.mock.calls[0] as [CustomEvent];
    expect(event.detail).toEqual({ propertyId: 42, initialText: 'Hello' });

    window.removeEventListener(CHAT_OPEN_EVENT, listener as EventListener);
  });
});
