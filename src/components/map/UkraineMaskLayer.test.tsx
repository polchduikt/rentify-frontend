import { render, screen } from '@testing-library/react';
import { UkraineMaskLayer } from './UkraineMaskLayer';

vi.mock('react-leaflet', () => ({
  GeoJSON: () => <div data-testid="geojson-layer" />,
}));

describe('UkraineMaskLayer', () => {
  it('renders three geojson overlays', () => {
    render(<UkraineMaskLayer />);
    expect(screen.getAllByTestId('geojson-layer')).toHaveLength(3);
  });
});
