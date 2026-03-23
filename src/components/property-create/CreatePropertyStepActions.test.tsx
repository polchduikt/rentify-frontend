import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreatePropertyStepActions } from './CreatePropertyStepActions';

describe('CreatePropertyStepActions', () => {
  it('handles actions in intermediate step mode', async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onSaveDraft = vi.fn();

    render(
      <CreatePropertyStepActions
        canGoPrev
        isSubmitting={false}
        isLastStep={false}
        isStepComplete
        onPrev={onPrev}
        onNext={onNext}
        onPublish={vi.fn()}
        onSaveDraft={onSaveDraft}
      />,
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);
    await user.click(buttons[1]);
    await user.click(buttons[2]);

    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onSaveDraft).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('disables previous and next when conditions are not met', () => {
    render(
      <CreatePropertyStepActions
        canGoPrev={false}
        isSubmitting={false}
        isLastStep={false}
        isStepComplete={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onPublish={vi.fn()}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });

  it('handles final step actions and submitting label', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSaveDraft = vi.fn();
    const onPublish = vi.fn();

    const { rerender } = render(
      <CreatePropertyStepActions
        canGoPrev
        isSubmitting={false}
        isLastStep
        isStepComplete
        submitLabel="Publish"
        submittingLabel="Publishing..."
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onPublish={onPublish}
        onSaveDraft={onSaveDraft}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Publish' }));
    expect(onPublish).toHaveBeenCalledTimes(1);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);
    await user.click(buttons[2]);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSaveDraft).toHaveBeenCalledTimes(1);

    rerender(
      <CreatePropertyStepActions
        canGoPrev
        isSubmitting
        isLastStep
        isStepComplete
        submitLabel="Publish"
        submittingLabel="Publishing..."
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onPublish={onPublish}
      />,
    );

    expect(screen.getByRole('button', { name: 'Publishing...' })).toBeDisabled();
  });
});
