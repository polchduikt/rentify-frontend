import { TileLayer } from 'react-leaflet';
import { HIGH_ZOOM_TILE, HIGH_ZOOM_TILE_MIN, LOW_ZOOM_TILE, LOW_ZOOM_TILE_MAX } from '@/constants/searchMap';

export const UkraineBaseTileLayers = () => (
  <>
    <TileLayer
      attribution={LOW_ZOOM_TILE.attribution}
      url={LOW_ZOOM_TILE.url}
      maxZoom={LOW_ZOOM_TILE_MAX}
      maxNativeZoom={LOW_ZOOM_TILE.maxNativeZoom}
      subdomains={[...LOW_ZOOM_TILE.subdomains]}
      noWrap
    />
    <TileLayer
      attribution={HIGH_ZOOM_TILE.attribution}
      url={HIGH_ZOOM_TILE.url}
      minZoom={HIGH_ZOOM_TILE_MIN}
      maxZoom={20}
      maxNativeZoom={HIGH_ZOOM_TILE.maxNativeZoom}
      subdomains={[...HIGH_ZOOM_TILE.subdomains]}
      noWrap
    />
  </>
);
