import { create } from 'zustand';
import { ExchangeRequest } from '@/types';
import { exchangeApi } from '@/api/exchange';

interface ExchangeState {
  exchanges: ExchangeRequest[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  fetchExchanges: (params?: any) => Promise<void>;
  approveExchange: (id: string) => Promise<void>;
}

export const useExchangeStore = create<ExchangeState>((set, get) => ({
  exchanges: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,

  fetchExchanges: async (params = {}) => {
    set({ loading: true });
    try {
      const data = await exchangeApi.list(params);
      set({
        exchanges: data.items || [],
        total: data.total,
        page: data.page,
        totalPages: data.totalPages || data.pages || 1,
        loading: false,
      });
    } catch (e) {
      set({ loading: false });
    }
  },

  approveExchange: async (id: string) => {
    await exchangeApi.approve(id);
    const { fetchExchanges } = get();
    await fetchExchanges();
  },
}));