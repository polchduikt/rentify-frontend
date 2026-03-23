import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AuthDivider,
  AuthErrorBanner,
  AuthField,
  AuthPasswordField,
} from './AuthFormParts';

describe('AuthFormParts', () => {
  it('renders AuthField label, hint, value and error', () => {
    render(
      <AuthField
        id="email"
        label="Email"
        hint="optional"
        value="john@example.com"
        readOnly
        error="Email is invalid"
      />,
    );

    expect(screen.getByLabelText(/Email/)).toHaveValue('john@example.com');
    expect(screen.getByText('optional')).toBeInTheDocument();
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
  });

  it('renders AuthPasswordField as password and toggles callback', async () => {
    const user = userEvent.setup();
    const onToggleShow = vi.fn();

    const { rerender } = render(
      <AuthPasswordField
        id="password"
        label="Password"
        value="secret"
        readOnly
        showPassword={false}
        onToggleShow={onToggleShow}
      />,
    );

    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button'));
    expect(onToggleShow).toHaveBeenCalledTimes(1);

    rerender(
      <AuthPasswordField
        id="password"
        label="Password"
        value="secret"
        readOnly
        showPassword
        onToggleShow={onToggleShow}
      />,
    );
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  });

  it('renders AuthPasswordField trailing action and error', () => {
    render(
      <AuthPasswordField
        id="password"
        label="Password"
        showPassword={false}
        onToggleShow={vi.fn()}
        trailingAction={<a href="/reset">Forgot?</a>}
        error="Required field"
      />,
    );

    expect(screen.getByRole('link', { name: 'Forgot?' })).toHaveAttribute('href', '/reset');
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('renders AuthErrorBanner only when message is present', () => {
    const { rerender } = render(<AuthErrorBanner message="" />);
    expect(screen.queryByText('Server error')).not.toBeInTheDocument();

    rerender(<AuthErrorBanner message="Server error" />);
    expect(screen.getByText('Server error')).toBeInTheDocument();
  });

  it('renders AuthDivider', () => {
    render(<AuthDivider />);
    expect(screen.getByText(/або/i)).toBeInTheDocument();
  });
});
