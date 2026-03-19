import { render, screen } from '@testing-library/react';
import { PROPERTY_CREATE_STEP_TITLES } from '@/constants/propertyCreateUi';
import { CreatePropertyStepHeader } from './CreatePropertyStepHeader';

describe('CreatePropertyStepHeader', () => {
  it('renders current step title and step number', () => {
    render(<CreatePropertyStepHeader step={0} />);

    expect(screen.getByRole('heading', { name: PROPERTY_CREATE_STEP_TITLES[0] })).toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument();
  });
});
