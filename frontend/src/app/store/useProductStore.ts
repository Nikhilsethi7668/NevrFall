import { create } from 'zustand';
import { productAPI } from '@/services/api';

interface ProductState {
  products: any[];
  nextCursor: string | null;
  loading: boolean;
  filters: Record<string, any>;
  hasMore: boolean;

  // Actions
  fetchProducts: (filters: any, isLoadMore?: boolean) => Promise<void>;
  setFilters: (filters: any) => void;
  resetStore: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  nextCursor: null,
  loading: false,
  filters: {},
  hasMore: true,

  fetchProducts: async (filters, isLoadMore = false) => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });

    try {
      // Prepare params
      const params = {
        ...filters,
        limit: 12,
        cursor: isLoadMore ? state.nextCursor : undefined,
      };

      const res = await productAPI.getByFilter(params);
      const newProducts = res.data.items || [];
      const nextCursor = res.data.nextCursor || null;

      set((currentState) => ({
        products: isLoadMore
          ? [...currentState.products, ...newProducts]
          : newProducts,
        nextCursor: nextCursor,
        hasMore: !!nextCursor,
        loading: false,
        filters,
      }));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      set({ loading: false });
    }
  },

  setFilters: (newFilters) => {
    // New filters always reset the list
    set({ filters: newFilters, nextCursor: null, hasMore: true });
  },

  resetStore: () => {
    set({
      products: [],
      nextCursor: null,
      loading: false,
      filters: {},
      hasMore: true
    });
  }
}));