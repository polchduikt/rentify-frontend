import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { PageQuery, SpringPage } from '@/types/api';
import type { ReviewDto, ReviewRequestDto } from '@/types/review';
import api from './api';
import { withPageQuery } from './queryParams';

export const reviewService = {
  async createReview(payload: ReviewRequestDto): Promise<ReviewDto> {
    const { data } = await api.post<ReviewDto>(API_ENDPOINTS.reviews.root, payload);
    return data;
  },

  async getPropertyReviews(propertyId: number, page?: PageQuery): Promise<SpringPage<ReviewDto>> {
    const { data } = await api.get<SpringPage<ReviewDto>>(API_ENDPOINTS.reviews.byProperty(propertyId), {
      params: withPageQuery(page),
    });
    return data;
  },
};
