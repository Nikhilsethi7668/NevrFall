import axios from '@/utils/axios';
import { ReturnRequest, PaginatedResponse } from '@/types';

export const returnApi = {
  list: async (params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResponse<ReturnRequest>> => {
    const { data } = await axios.get('/return', { params });
    return data;
  },
  approve: async (id: string) => {
    const { data } = await axios.post(`/return/${id}/approve`);
    return data;
  },
  receive: async (id: string, payload?: { condition?: string; adminNotes?: string; restockingFee?: number }) => {
    const { data } = await axios.post(`/return/${id}/receive`, payload || {});
    return data;
  },
};