import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';
import { formatPropertyCreatedAt } from '@/utils/propertyDetails';
import { PropertyDetailsSidebar } from './PropertyDetailsSidebar';

vi.mock('@/utils/propertyDetails', () => ({
  formatPropertyCreatedAt: vi.fn(),
}));

const mockedFormatPropertyCreatedAt = vi.mocked(formatPropertyCreatedAt);

const makeProperty = (overrides: Partial<PropertyResponseDto> = {}): PropertyResponseDto => ({
  id: 100,
  hostId: 77,
  address: {
    location: {
      country: 'Ukraine',
      region: 'Kyivska',
      city: 'Kyiv',
    },
    street: 'Test',
    houseNumber: '1',
  },
  title: 'Property',
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
  topPromotedUntil: '2026-03-20T00:00:00Z',
  rooms: 2,
  floor: 3,
  totalFloors: 10,
  areaSqm: 50,
  maxGuests: 2,
  checkInTime: '14:00:00',
  checkOutTime: '11:00:00',
  pricing: { pricePerMonth: 12000, currency: 'UAH' },
  rules: {},
  photos: [],
  amenities: [],
  createdAt: '2026-03-10T00:00:00Z',
  updatedAt: '2026-03-10T00:00:00Z',
  ...overrides,
});

const owner: PublicUserProfileDto = {
  id: 77,
  firstName: 'Anna',
  lastName: 'Lee',
  phone: '+380971112233',
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2025-01-01T00:00:00Z',
};

describe('PropertyDetailsSidebar', () => {
  beforeEach(() => {
    mockedFormatPropertyCreatedAt.mockReturnValue('01.01.2025');
  });

  it('renders owner block with avatar and profile link', () => {
    render(
      <MemoryRouter>
        <PropertyDetailsSidebar
          property={makeProperty()}
          owner={owner}
          ownerLoading={false}
          ownerName="Anna Lee"
          ownerInitial="AL"
          ownerPhone={owner.phone || ''}
          isPhoneVisible={false}
          onContactHost={vi.fn()}
          onShowPhone={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByAltText('Anna Lee')).toHaveAttribute('src', owner.avatarUrl);
    expect(screen.getByRole('link', { name: 'Anna Lee' })).toHaveAttribute('href', '/users/77');
    expect(screen.getByText(/01\.01\.2025/)).toBeInTheDocument();
  });

  it('shows loading skeleton when owner data is loading', () => {
    const { container } = render(
      <MemoryRouter>
        <PropertyDetailsSidebar
          property={makeProperty()}
          ownerLoading
          ownerName="Owner"
          ownerInitial="O"
          ownerPhone=""
          isPhoneVisible={false}
          onContactHost={vi.fn()}
          onShowPhone={vi.fn()}
        />
      </MemoryRouter>,
    );

    const loadingBlock = container.querySelector('.animate-pulse');
    expect(loadingBlock).toBeInTheDocument();
  });

  it('triggers contact and show phone callbacks', async () => {
    const user = userEvent.setup();
    const onContactHost = vi.fn();
    const onShowPhone = vi.fn();

    render(
      <MemoryRouter>
        <PropertyDetailsSidebar
          property={makeProperty()}
          owner={owner}
          ownerLoading={false}
          ownerName="Anna Lee"
          ownerInitial="AL"
          ownerPhone={owner.phone || ''}
          isPhoneVisible={false}
          onContactHost={onContactHost}
          onShowPhone={onShowPhone}
        />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    await user.click(buttons[1]);

    expect(onContactHost).toHaveBeenCalledTimes(1);
    expect(onShowPhone).toHaveBeenCalledTimes(1);
  });

  it('disables contact button when requested', () => {
    render(
      <MemoryRouter>
        <PropertyDetailsSidebar
          property={makeProperty()}
          owner={owner}
          ownerLoading={false}
          ownerName="Anna Lee"
          ownerInitial="AL"
          ownerPhone={owner.phone || ''}
          isPhoneVisible={false}
          onContactHost={vi.fn()}
          onShowPhone={vi.fn()}
          disableContactHost
        />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });
});
