import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bell } from 'lucide-react';
import { MetricCard } from './MetricCard';

describe('MetricCard', () => {
  it('renders core metric data', () => {
    render(
      <MetricCard
        title="Balance"
        value="1,250 UAH"
        hint="Updated 1 minute ago"
        icon={Bell}
      />,
    );

    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('1,250 UAH')).toBeInTheDocument();
    expect(screen.getByText('Updated 1 minute ago')).toBeInTheDocument();
  });

  it('calls action callback when action button is clicked', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <MetricCard
        title="Balance"
        value="1,250 UAH"
        hint="Updated 1 minute ago"
        icon={Bell}
        actionLabel="Top up"
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Top up' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('disables action when loading state is enabled', () => {
    render(
      <MetricCard
        title="Balance"
        value="1,250 UAH"
        hint="Updated 1 minute ago"
        icon={Bell}
        actionLabel="Top up"
        actionLoading
        onAction={vi.fn()}
      />,
    );

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Top up' })).not.toBeInTheDocument();
  });
});
