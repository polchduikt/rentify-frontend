import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { APP_CONTENT } from '@/constants/appContent.ts';
import { FOOTER_LINKS } from '@/constants/footerLinks.ts';
import { ROUTES } from '@/config/routes.ts';
import Footer from './Footer.tsx';

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );

describe('Footer', () => {
  it('renders brand and contact info', () => {
    renderFooter();

    expect(screen.getByText(APP_CONTENT.companyName)).toBeInTheDocument();
    expect(screen.getByText(APP_CONTENT.tagline)).toBeInTheDocument();
    expect(screen.getByText(APP_CONTENT.contacts.phone)).toBeInTheDocument();
    expect(screen.getByText(APP_CONTENT.contacts.email)).toBeInTheDocument();
    expect(screen.getByText(APP_CONTENT.contacts.location)).toBeInTheDocument();
  });

  it('renders social links with external attributes', () => {
    renderFooter();

    const socialCases = [
      { label: 'Facebook', href: APP_CONTENT.socialLinks.facebook },
      { label: 'Instagram', href: APP_CONTENT.socialLinks.instagram },
      { label: 'YouTube', href: APP_CONTENT.socialLinks.youtube },
    ];

    socialCases.forEach(({ label, href }) => {
      const link = screen.getByRole('link', { name: label });
      expect(link).toHaveAttribute('href', href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    });
  });

  it('renders grouped navigation links', () => {
    renderFooter();

    const allLinks = screen.getAllByRole('link');
    const groupedLinks = Object.values(FOOTER_LINKS).flat();

    groupedLinks.forEach(({ label, to }) => {
      const matchingByLabel = screen.getAllByRole('link', { name: label });
      expect(matchingByLabel.length).toBeGreaterThan(0);

      const hasExpectedHref = allLinks.some((link) => link.getAttribute('href') === to);
      expect(hasExpectedHref).toBe(true);
    });
  });

  it('renders policy links in footer bottom', () => {
    renderFooter();

    const allLinks = screen.getAllByRole('link');
    const hasPrivacyLink = allLinks.some((link) => link.getAttribute('href') === ROUTES.privacy);
    const hasTermsLink = allLinks.some((link) => link.getAttribute('href') === ROUTES.terms);

    expect(hasPrivacyLink).toBe(true);
    expect(hasTermsLink).toBe(true);
  });
});
