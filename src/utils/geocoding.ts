interface NominatimItem {
  lat: string;
  lon: string;
}

interface NominatimReverseAddress {
  country?: string;
  state?: string;
  region?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  road?: string;
  house_number?: string;
  postcode?: string;
}

interface NominatimReverseResponse {
  lat: string;
  lon: string;
  display_name?: string;
  address?: NominatimReverseAddress;
}

export interface GeocodingPoint {
  lat: number;
  lng: number;
}

export interface ReverseGeocodingAddress {
  country?: string;
  region?: string;
  city?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  displayName?: string;
}

export const geocodeAddress = async (query: string, signal?: AbortSignal): Promise<GeocodingPoint | undefined> => {
  const normalized = query.trim();
  if (!normalized) {
    return undefined;
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', normalized);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      'Accept-Language': 'uk,en',
    },
  });

  if (!response.ok) {
    return undefined;
  }

  const items = (await response.json()) as NominatimItem[];
  const first = items[0];
  if (!first) {
    return undefined;
  }

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return undefined;
  }

  return { lat, lng };
};

export const reverseGeocodeCoordinates = async (
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<ReverseGeocodingAddress | undefined> => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return undefined;
  }

  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('zoom', '18');
  url.searchParams.set('addressdetails', '1');

  const response = await fetch(url.toString(), {
    signal,
    headers: {
      'Accept-Language': 'uk,en',
    },
  });

  if (!response.ok) {
    return undefined;
  }

  const data = (await response.json()) as NominatimReverseResponse;
  const address = data.address;
  if (!address) {
    return undefined;
  }

  return {
    country: address.country,
    region: address.state ?? address.region,
    city: address.city ?? address.town ?? address.village ?? address.municipality,
    street: address.road,
    houseNumber: address.house_number,
    postalCode: address.postcode,
    displayName: data.display_name,
  };
};
