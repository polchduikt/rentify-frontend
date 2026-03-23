import { render, screen } from '@testing-library/react';
import { HIGH_ZOOM_TILE, LOW_ZOOM_TILE } from '@/constants/searchMap';
import { UkraineBaseTileLayers } from './UkraineBaseTileLayers';

vi.mock('react-leaflet', () => ({
  TileLayer: ({ url }: { url: string }) => <div data-testid="tile-layer" data-url={url} />,
}));

describe('UkraineBaseTileLayers', () => {
  it('renders both low and high zoom tile layers', () => {
    render(<UkraineBaseTileLayers />);

    const layers = screen.getAllByTestId('tile-layer');
    expect(layers).toHaveLength(2);
    expect(layers[0]).toHaveAttribute('data-url', LOW_ZOOM_TILE.url);
    expect(layers[1]).toHaveAttribute('data-url', HIGH_ZOOM_TILE.url);
  });
});
