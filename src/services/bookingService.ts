import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { PageQuery, SpringPage } from '@/types/api';
import type { BookingDto, BookingRequestDto } from '@/types/booking';
import api from './api';
import { withPageQuery } from './queryParams';

export const bookingService = {
  async createBooking(payload: BookingRequestDto): Promise<BookingDto> {
    const { data } = await api.post<BookingDto>(API_ENDPOINTS.bookings.root, payload);
    return data;
  },

  async getMyBookings(page?: PageQuery): Promise<SpringPage<BookingDto>> {
    const { data } = await api.get<SpringPage<BookingDto>>(API_ENDPOINTS.bookings.list, {
      params: { ...withPageQuery(page), role: 'guest' },
    });
    return data;
  },

  async getIncomingBookings(page?: PageQuery): Promise<SpringPage<BookingDto>> {
    const { data } = await api.get<SpringPage<BookingDto>>(API_ENDPOINTS.bookings.list, {
      params: { ...withPageQuery(page), role: 'host' },
    });
    return data;
  },

  async getBookingById(id: number): Promise<BookingDto> {
    const { data } = await api.get<BookingDto>(API_ENDPOINTS.bookings.byId(id));
    return data;
  },

  async cancelBooking(id: number): Promise<BookingDto> {
    const { data } = await api.post<BookingDto>(API_ENDPOINTS.bookings.cancellation(id));
    return data;
  },

  async confirmBooking(id: number): Promise<BookingDto> {
    const { data } = await api.post<BookingDto>(API_ENDPOINTS.bookings.confirmation(id));
    return data;
  },

  async rejectBooking(id: number): Promise<BookingDto> {
    const { data } = await api.post<BookingDto>(API_ENDPOINTS.bookings.rejection(id));
    return data;
  },
};
