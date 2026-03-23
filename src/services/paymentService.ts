import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { PaymentResponseDto } from '@/types/payment';
import api from './api';

export const paymentService = {
  async mockPayBooking(bookingId: number): Promise<PaymentResponseDto> {
    const { data } = await api.post<PaymentResponseDto>(API_ENDPOINTS.payments.root, { bookingId });
    return data;
  },

  async getMyPayments(): Promise<PaymentResponseDto[]> {
    const { data } = await api.get<PaymentResponseDto[]>(API_ENDPOINTS.payments.root);
    return data;
  },

  async getPaymentsByBooking(bookingId: number): Promise<PaymentResponseDto[]> {
    const { data } = await api.get<PaymentResponseDto[]>(API_ENDPOINTS.payments.byBooking(bookingId));
    return data;
  },
};
