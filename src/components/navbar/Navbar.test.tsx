import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ROUTES } from '@/config/routes.ts';
import { useAuth } from '@/contexts/AuthContext.tsx';
import { useTheme } from '@/contexts/ThemeContext.tsx';
import type { UserSessionDto } from '@/types/user.ts';
import Navbar from './Navbar';

vi.mock('@/contexts/AuthContext.tsx', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/contexts/ThemeContext.tsx', () => ({
  useTheme: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseTheme = vi.mocked(useTheme);

const createAuthState = (overrides?: Partial<ReturnType<typeof useAuth>>) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn().mockResolvedValue(undefined),
  register: vi.fn().mockResolvedValue(undefined),
  loginWithGoogle: vi.fn().mockResolvedValue(undefined),
  refreshProfile: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const renderNavbar = (path = ROUTES.home) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar />
    </MemoryRouter>,
  );

const hasLinkWithHref = (href: string) =>
  screen.getAllByRole('link').some((link) => link.getAttribute('href') === href);

describe('Navbar', () => {
  beforeEach(() => {
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });
    mockedUseAuth.mockReturnValue(createAuthState());
  });

  it('renders guest navigation links for unauthenticated users', () => {
    renderNavbar();

    expect(hasLinkWithHref(ROUTES.login)).toBe(true);
    expect(hasLinkWithHref(ROUTES.register)).toBe(true);
    expect(hasLinkWithHref(ROUTES.createProperty)).toBe(false);
  });

  it('renders authenticated navigation links and avatar initials fallback', () => {
    const user: UserSessionDto = {
      id: 1,
      firstName: 'Anna',
      lastName: 'Lee',
      avatarUrl: '',
      roles: ['USER'],
    };

    mockedUseAuth.mockReturnValue(
      createAuthState({
        isAuthenticated: true,
        user,
      }),
    );

    renderNavbar();

    expect(hasLinkWithHref(ROUTES.profile)).toBe(true);
    expect(hasLinkWithHref(ROUTES.favorites)).toBe(true);
    expect(hasLinkWithHref(ROUTES.createProperty)).toBe(true);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders avatar image when authenticated user has avatar URL', () => {
    const avatarUrl = 'https://example.com/avatar.png';
    const user: UserSessionDto = {
      id: 1,
      firstName: 'Anna',
      lastName: 'Lee',
      avatarUrl,
      roles: ['USER'],
    };

    mockedUseAuth.mockReturnValue(
      createAuthState({
        isAuthenticated: true,
        user,
      }),
    );

    const { container } = renderNavbar();
    const avatarImage = container.querySelector(`img[src="${avatarUrl}"]`);

    expect(avatarImage).toBeInTheDocument();
  });

  it('opens mobile menu when toggler is clicked', async () => {
    const user = userEvent.setup();
    renderNavbar();

    const loginLinksBefore = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === ROUTES.login).length;
    const buttons = screen.getAllByRole('button');
    const menuToggleButton = buttons[buttons.length - 1];

    await user.click(menuToggleButton);

    const loginLinksAfter = screen.getAllByRole('link').filter((link) => link.getAttribute('href') === ROUTES.login).length;
    expect(loginLinksAfter).toBeGreaterThan(loginLinksBefore);
  });
});
