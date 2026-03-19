import { render, screen } from '@testing-library/react';
import { Notice } from './Notice';

describe('Notice', () => {
  it('renders success variant styles', () => {
    const { container } = render(<Notice type="success" message="Operation completed" />);

    expect(screen.getByText('Operation completed')).toBeInTheDocument();
    const root = container.firstElementChild;
    expect(root).toHaveClass('border-emerald-200');
    expect(root).toHaveClass('bg-emerald-50');
  });

  it('renders error variant styles', () => {
    const { container } = render(<Notice type="error" message="Operation failed" />);

    expect(screen.getByText('Operation failed')).toBeInTheDocument();
    const root = container.firstElementChild;
    expect(root).toHaveClass('border-rose-200');
    expect(root).toHaveClass('bg-rose-50');
  });
});
