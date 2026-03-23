import { render, screen } from '@testing-library/react';
import { AuthPageLayout } from './AuthPageLayout';

describe('AuthPageLayout', () => {
  it('renders left and right content with image metadata', () => {
    render(
      <AuthPageLayout
        photoUrl="https://example.com/auth.jpg"
        imageAlt="Auth visual"
        overlayClassName="bg-black/40"
        leftEyebrow="Welcome"
        leftTitle="Rent better"
        leftContent={<p>Left paragraph</p>}
        rightContent={<form aria-label="auth form">Form body</form>}
      />,
    );

    expect(screen.getByAltText('Auth visual')).toHaveAttribute('src', 'https://example.com/auth.jpg');
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Rent better' })).toBeInTheDocument();
    expect(screen.getByText('Left paragraph')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'auth form' })).toBeInTheDocument();
    expect(screen.getByText('Form body')).toBeInTheDocument();
  });
});
