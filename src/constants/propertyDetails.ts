import { UKRAINE_REGION_LABELS } from '@/constants/ukraineRegionLabels';

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1800&q=80';

export const UKRAINE_DEFAULT_CENTER: [number, number] = [49.0, 31.0];

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Квартира',
  HOUSE: 'Будинок',
  ROOM: 'Кімната',
  STUDIO: 'Студія',
  PENTHOUSE: 'Пентхаус',
  TOWNHOUSE: 'Таунхаус',
};

export const MARKET_TYPE_LABELS: Record<string, string> = {
  SECONDARY: 'Вторинний ринок',
  NEW_BUILD: 'Новобудова',
};

export const CITY_COORDS: Record<string, [number, number]> = {
  'київ': [50.4501, 30.5234],
  'львів': [49.8397, 24.0297],
  'одеса': [46.4825, 30.7233],
  'харків': [49.9935, 36.2304],
  'дніпро': [48.4647, 35.0462],
  'запоріжжя': [47.8388, 35.1396],
  'вінниця': [49.2331, 28.4682],
  'полтава': [49.5883, 34.5514],
  'миколаїв': [46.975, 31.9946],
  'чернігів': [51.4982, 31.2893],
  'черкаси': [49.4444, 32.0598],
  'суми': [50.9077, 34.7981],
  'хмельницький': [49.42298, 26.98713],
  'рівне': [50.6199, 26.2516],
  'житомир': [50.2547, 28.6587],
  'тернопіль': [49.5535, 25.5948],
  'луцьк': [50.7472, 25.3254],
  'івано-франківськ': [48.9226, 24.7111],
  'ужгород': [48.6208, 22.2879],
  'чернівці': [48.2921, 25.9358],
  'кропивницький': [48.5079, 32.2623],
  'херсон': [46.6354, 32.6169],
};

export const resolveLocationFallback = (city?: string, region?: string): [number, number] => {
  const cityKey = city?.trim().toLowerCase() || '';
  const cityPoint = CITY_COORDS[cityKey];
  if (cityPoint) {
    return cityPoint;
  }

  const normalizedRegion = (region || '').toLowerCase();
  const regionPoint = UKRAINE_REGION_LABELS.find((item) => normalizedRegion.includes(item.name.toLowerCase()));
  if (regionPoint) {
    return [regionPoint.lat, regionPoint.lng];
  }

  return UKRAINE_DEFAULT_CENTER;
};
