import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PROPERTY_CREATE_STEP_TITLES } from '@/constants/propertyCreateUi';
import { CreatePropertySidebar } from './CreatePropertySidebar';

describe('CreatePropertySidebar', () => {
  it('renders all wizard step buttons', () => {
    render(
      <CreatePropertySidebar
        step={1}
        stepLocks={[false, false, true, true, true]}
        onStepClick={vi.fn()}
      />,
    );

    const stepButtons = screen.getAllByRole('button');
    expect(stepButtons).toHaveLength(PROPERTY_CREATE_STEP_TITLES.length);
    expect(stepButtons[2]).toBeDisabled();
    expect(stepButtons[3]).toBeDisabled();
    expect(stepButtons[4]).toBeDisabled();
  });

  it('calls onStepClick for available steps', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();

    render(
      <CreatePropertySidebar
        step={0}
        stepLocks={[false, false, true, true, true]}
        onStepClick={onStepClick}
      />,
    );

    const stepButtons = screen.getAllByRole('button');
    await user.click(stepButtons[1]);
    expect(onStepClick).toHaveBeenCalledWith(1);
  });
});
