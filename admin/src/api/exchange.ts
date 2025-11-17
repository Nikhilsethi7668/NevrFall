import axios from '@/utils/axios';
import { ExchangeRequest, PaginatedResponse } from '@/types';

export const exchangeApi = {
  list: async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<ExchangeRequest>> => {
    const { data } = await axios.get('/exchange', { params });
    return data;
  },
  approve: async (exchangeId: string) => {
    const { data } = await axios.post(`/exchange/${exchangeId}/approve`);
    return data;
  },
};