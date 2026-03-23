import { render, screen } from '@testing-library/react';
import { CreatePropertyStatusBanners } from './CreatePropertyStatusBanners';

describe('CreatePropertyStatusBanners', () => {
  it('renders both error and success banners when values are provided', () => {
    render(
      <CreatePropertyStatusBanners
        submitError="Validation failed"
        submitSuccess="Draft saved successfully"
      />,
    );

    expect(screen.getByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('Draft saved successfully')).toBeInTheDocument();
  });

  it('renders no banners when both values are empty', () => {
    const { container } = render(
      <CreatePropertyStatusBanners
        submitError=""
        submitSuccess=""
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
