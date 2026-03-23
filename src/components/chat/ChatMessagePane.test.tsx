import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { MemoryRouter } from 'react-router-dom';
import type { ConversationDto, MessageDto } from '@/types/conversation';
import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';
import { ChatMessagePane } from './ChatMessagePane';

const makeConversation = (overrides: Partial<ConversationDto> = {}): ConversationDto => ({
  id: 1,
  propertyId: 10,
  hostId: 100,
  tenantId: 200,
  createdAt: '2026-03-10T12:00:00Z',
  ...overrides,
});

const makeMessage = (overrides: Partial<MessageDto> = {}): MessageDto => ({
  id: 1,
  conversationId: 1,
  senderId: 100,
  type: 'TEXT',
  text: 'Hello from owner',
  isRead: true,
  mediaUrl: '',
  createdAt: '2026-03-10T12:01:00Z',
  ...overrides,
});

const makeProfile = (overrides: Partial<PublicUserProfileDto> = {}): PublicUserProfileDto => ({
  id: 200,
  firstName: 'Ivan',
  lastName: 'Petrenko',
  phone: null,
  avatarUrl: '',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const makeProperty = (overrides: Partial<PropertyResponseDto> = {}): PropertyResponseDto => ({
  id: 10,
  hostId: 100,
  address: {
    location: { country: 'Ukraine', region: 'Kyivska', city: 'Kyiv' },
    street: 'Khreshchatyk',
    houseNumber: '1',
  },
  title: 'Central apartment',
  description: 'Description',
  rentalType: 'LONG_TERM',
  status: 'ACTIVE',
  propertyType: 'APARTMENT',
  marketType: 'SECONDARY',
  isVerifiedProperty: true,
  isVerifiedRealtor: false,
  isDuplicate: false,
  isTopPromoted: false,
  viewCount: 0,
  reviewCount: 0,
  averageRating: 0,
  topPromotedUntil: '2026-04-01T00:00:00Z',
  rooms: 2,
  floor: 3,
  totalFloors: 10,
  areaSqm: 50,
  maxGuests: 2,
  checkInTime: '14:00:00',
  checkOutTime: '11:00:00',
  pricing: { pricePerMonth: 15000, currency: 'UAH' },
  rules: {},
  photos: [],
  amenities: [],
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
  ...overrides,
});

describe('ChatMessagePane', () => {
  it('renders messages and sends by button and Enter key', async () => {
    const user = userEvent.setup();
    const onDraftChange = vi.fn();
    const onSend = vi.fn().mockResolvedValue(undefined);

    const conversation = makeConversation();
    const messages = [
      makeMessage({ id: 1, senderId: 100, text: 'Hello from owner' }),
      makeMessage({ id: 2, senderId: 999, text: 'Reply from me' }),
    ];

    const { container } = render(
      <MemoryRouter>
        <ChatMessagePane
          showOnMobile={false}
          activeConversationId={conversation.id}
          activeConversation={conversation}
          composePropertyId={null}
          composeProperty={null}
          activeProperty={makeProperty()}
          activeCounterpartProfile={makeProfile()}
          profilesLoading={false}
          propertiesLoading={false}
          messages={messages}
          messagesLoading={false}
          messagesError={null}
          currentUserId={999}
          messageDraft="Draft"
          sendError={null}
          hasTarget
          isSending={false}
          canSend
          onDraftChange={onDraftChange}
          onSend={onSend}
          onBack={vi.fn()}
          messagesEndRef={createRef<HTMLDivElement>()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Hello from owner')).toBeInTheDocument();
    expect(screen.getByText('Reply from me')).toBeInTheDocument();

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, '!');
    expect(onDraftChange).toHaveBeenCalled();

    const sendButton = container.querySelector('button[aria-label]');
    if (!sendButton) {
      throw new Error('Send button not found');
    }

    await user.click(sendButton);
    expect(onSend).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: false });
    expect(onSend).toHaveBeenCalledTimes(2);
  });
});
