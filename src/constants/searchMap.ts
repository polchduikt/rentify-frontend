export const UKRAINE_MAP_CENTER: [number, number] = [48.55, 31.2];
export const UKRAINE_LOCKED_MIN_ZOOM = 7.25;
export const UKRAINE_MAX_ZOOM = 19;

export const LOW_ZOOM_TILE_MAX = 9;
export const HIGH_ZOOM_TILE_MIN = 10;

export const LOW_ZOOM_TILE = {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/light_nolabels/{z}/{x}/{y}{r}.png',
  maxNativeZoom: 20,
  subdomains: ['a', 'b', 'c', 'd'] as const,
};

export const HIGH_ZOOM_TILE = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  maxNativeZoom: 19,
  subdomains: ['a', 'b', 'c'] as const,
};
