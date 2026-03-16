import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { PageQuery, SpringPage } from '@/types/api';
import type { PropertyStatus } from '@/types/enums';
import type {
  AvailabilityBlockDto,
  AvailabilityBlockRequestDto,
  PropertyCreateRequestDto,
  PropertyMapPinDto,
  PropertyPhotoDto,
  PropertyResponseDto,
  PropertySearchCriteriaDto,
  PropertyStatusUpdateRequestDto,
  UnavailableDateRangeDto,
} from '@/types/property';
import api from './api';
import { cleanQueryParams, withPageQuery } from './queryParams';

export interface UnavailableRangesQuery {
  dateFrom?: string;
  dateTo?: string;
}

type UnavailableRangeApiDto = Partial<UnavailableDateRangeDto> & {
  date_from?: string;
  date_to?: string;
  booking_status?: UnavailableDateRangeDto['bookingStatus'];
  reason?: string | null;
};

export const propertyService = {
  async getAllProperties(page?: PageQuery): Promise<SpringPage<PropertyResponseDto>> {
    const { data } = await api.get<SpringPage<PropertyResponseDto>>(API_ENDPOINTS.properties.root, {
      params: withPageQuery(page),
    });
    return data;
  },

  async getMyProperties(page?: PageQuery): Promise<SpringPage<PropertyResponseDto>> {
    const { data } = await api.get<SpringPage<PropertyResponseDto>>(API_ENDPOINTS.properties.mine, {
      params: withPageQuery(page),
    });
    return data;
  },

  async getMyPropertiesFiltered(
    page?: PageQuery,
    statuses?: PropertyStatus[]
  ): Promise<SpringPage<PropertyResponseDto>> {
    const { data } = await api.get<SpringPage<PropertyResponseDto>>(API_ENDPOINTS.properties.mine, {
      params: {
        ...withPageQuery(page),
        ...(statuses && statuses.length > 0 ? { statuses: statuses.join(',') } : {}),
      },
    });
    return data;
  },

  async getPropertyById(id: number): Promise<PropertyResponseDto> {
    const { data } = await api.get<PropertyResponseDto>(API_ENDPOINTS.properties.byId(id));
    return data;
  },

  async createProperty(payload: PropertyCreateRequestDto): Promise<PropertyResponseDto> {
    const { data } = await api.post<PropertyResponseDto>(API_ENDPOINTS.properties.root, payload);
    return data;
  },

  async updateProperty(id: number, payload: PropertyCreateRequestDto): Promise<PropertyResponseDto> {
    const { data } = await api.put<PropertyResponseDto>(API_ENDPOINTS.properties.byId(id), payload);
    return data;
  },

  async deleteProperty(id: number): Promise<void> {
    await api.delete(API_ENDPOINTS.properties.byId(id));
  },

  async uploadPhoto(id: number, file: File): Promise<PropertyPhotoDto> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<PropertyPhotoDto>(API_ENDPOINTS.properties.photos(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data;
  },

  async deletePhoto(id: number, photoId: number): Promise<void> {
    await api.delete(API_ENDPOINTS.properties.photoById(id, photoId));
  },

  async searchProperties(
    criteria?: PropertySearchCriteriaDto,
    page?: PageQuery
  ): Promise<SpringPage<PropertyResponseDto>> {
    const { data } = await api.get<SpringPage<PropertyResponseDto>>(API_ENDPOINTS.properties.search, {
      params: {
        ...cleanQueryParams(criteria ?? {}),
        ...withPageQuery(page),
      },
    });
    return data;
  },

  async searchMapPins(
    criteria?: PropertySearchCriteriaDto,
    page?: PageQuery
  ): Promise<SpringPage<PropertyMapPinDto>> {
    const { data } = await api.get<SpringPage<PropertyMapPinDto>>(API_ENDPOINTS.properties.searchMapPins, {
      params: {
        ...cleanQueryParams(criteria ?? {}),
        ...withPageQuery(page),
      },
    });
    return data;
  },

  async createAvailabilityBlock(
    propertyId: number,
    payload: AvailabilityBlockRequestDto
  ): Promise<AvailabilityBlockDto> {
    const { data } = await api.post<AvailabilityBlockDto>(API_ENDPOINTS.properties.availability(propertyId), payload);
    return data;
  },

  async getAvailabilityBlocks(propertyId: number): Promise<AvailabilityBlockDto[]> {
    const { data } = await api.get<AvailabilityBlockDto[]>(API_ENDPOINTS.properties.availability(propertyId));
    return data;
  },

  async getUnavailableRanges(
    propertyId: number,
    query?: UnavailableRangesQuery
  ): Promise<UnavailableDateRangeDto[]> {
    const { data } = await api.get<UnavailableRangeApiDto[]>(
      API_ENDPOINTS.properties.unavailableRanges(propertyId),
      {
        params: cleanQueryParams({
          dateFrom: query?.dateFrom,
          dateTo: query?.dateTo,
        }),
      }
    );

    const rawRanges = Array.isArray(data) ? data : data ? [data] : [];

    return rawRanges
      .map((range) => ({
        dateFrom: range.dateFrom ?? range.date_from ?? '',
        dateTo: range.dateTo ?? range.date_to ?? '',
        source: String(range.source ?? ''),
        bookingStatus: range.bookingStatus ?? range.booking_status ?? null,
        reason: range.reason ?? null,
      }))
      .filter((range) => Boolean(range.dateFrom && range.dateTo));
  },

  async changePropertyStatus(
    propertyId: number,
    payload: PropertyStatusUpdateRequestDto
  ): Promise<PropertyResponseDto> {
    const { data } = await api.patch<PropertyResponseDto>(API_ENDPOINTS.properties.status(propertyId), payload);
    return data;
  },

  async deleteAvailabilityBlock(propertyId: number, blockId: number): Promise<void> {
    await api.delete(API_ENDPOINTS.properties.availabilityBlockById(propertyId, blockId));
  },
};
