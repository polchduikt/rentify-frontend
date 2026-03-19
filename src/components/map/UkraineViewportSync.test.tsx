import { act, render } from '@testing-library/react';
import { UKRAINE_LOCKED_MIN_ZOOM } from '@/constants/searchMap';
import { UkraineViewportSync } from './UkraineViewportSync';

const leafletMocks = vi.hoisted(() => ({
  useMapMock: vi.fn(),
  useMapEventsMock: vi.fn(),
  handlers: {} as Record<string, () => void>,
}));

vi.mock('react-leaflet', () => ({
  useMap: () => leafletMocks.useMapMock(),
  useMapEvents: (handlers: Record<string, () => void>) => {
    leafletMocks.handlers = handlers;
    leafletMocks.useMapEventsMock(handlers);
    return null;
  },
}));

describe('UkraineViewportSync', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('initializes map viewport and emits bounds on map events', () => {
    const map = {
      invalidateSize: vi.fn(),
      fitBounds: vi.fn(),
      getZoom: vi.fn().mockReturnValue(6),
      setZoom: vi.fn(),
      setMinZoom: vi.fn(),
      getBounds: vi.fn().mockReturnValue({
        getSouthWest: () => ({ lat: 47.1, lng: 29.2 }),
        getNorthEast: () => ({ lat: 50.3, lng: 33.4 }),
      }),
    };
    leafletMocks.useMapMock.mockReturnValue(map);

    const onBoundsChange = vi.fn();
    const onMapClick = vi.fn();

    render(<UkraineViewportSync onBoundsChange={onBoundsChange} onMapClick={onMapClick} />);

    act(() => {
      vi.runAllTimers();
    });

    expect(map.invalidateSize).toHaveBeenCalledTimes(1);
    expect(map.fitBounds).toHaveBeenCalledTimes(1);
    expect(map.setZoom).toHaveBeenCalledWith(UKRAINE_LOCKED_MIN_ZOOM, { animate: false });
    expect(map.setMinZoom).toHaveBeenCalledWith(UKRAINE_LOCKED_MIN_ZOOM);
    expect(onBoundsChange).toHaveBeenCalledWith({
      southWestLat: 47.1,
      southWestLng: 29.2,
      northEastLat: 50.3,
      northEastLng: 33.4,
    });

    act(() => {
      leafletMocks.handlers.moveend();
      leafletMocks.handlers.zoomend();
      leafletMocks.handlers.click();
    });

    expect(onBoundsChange).toHaveBeenCalledTimes(3);
    expect(onMapClick).toHaveBeenCalledTimes(1);
  });
});
