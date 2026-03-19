import { render } from '@testing-library/react';
import { HOME_FAQ_ITEMS } from '@/constants/homePageContent';
import HomeFaqSection from './HomeFaqSection';

describe('HomeFaqSection', () => {
  it('renders all FAQ entries and opens first item by default', () => {
    const { container } = render(<HomeFaqSection />);
    const details = container.querySelectorAll('details');

    expect(details).toHaveLength(HOME_FAQ_ITEMS.length);
    expect(details[0]).toHaveAttribute('open');

    for (let i = 1; i < details.length; i += 1) {
      expect(details[i]).not.toHaveAttribute('open');
    }
  });
});
