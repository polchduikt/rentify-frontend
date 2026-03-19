import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { ConversationDto } from '@/types/conversation';
import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';
import { ChatConversationList } from './ChatConversationList';

const makeConversation = (overrides: Partial<ConversationDto> = {}): ConversationDto => ({
  id: 1,
  propertyId: 10,
  hostId: 100,
  tenantId: 200,
  createdAt: '2026-03-10T12:00:00Z',
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

describe('ChatConversationList', () => {
  it('renders conversation and selects it on click', async () => {
    const user = userEvent.setup();
    const conversation = makeConversation();
    const profile = makeProfile();
    const property = makeProperty();
    const onSelectConversation = vi.fn();

    render(
      <MemoryRouter>
        <ChatConversationList
          showOnMobile
          conversations={[conversation]}
          conversationsLoading={false}
          conversationsError={null}
          activeConversationId={null}
          counterpartIdByConversationId={new Map([[conversation.id, profile.id]])}
          profilesById={new Map([[profile.id, profile]])}
          propertiesById={new Map([[property.id, property]])}
          onSelectConversation={onSelectConversation}
          resolveConversationPropertyLabel={() => 'Open property'}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Ivan Petrenko')).toBeInTheDocument();
    expect(screen.getByText('Central apartment')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open property' })).toHaveAttribute('href', '/properties/10');

    await user.click(screen.getByRole('button'));
    expect(onSelectConversation).toHaveBeenCalledWith(conversation.id);
  });
});
