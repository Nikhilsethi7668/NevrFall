import axios from '@/utils/axios';
import { Collection } from '@/types';

export const collectionsApi = {
  getCollections: async (): Promise<Collection[]> => {
    const { data } = await axios.get('/products/getAllCollections');
    return data.data;
  },
  createCollection: async (payload: Partial<Collection>) => {
    const { data } = await axios.post('/admin/products/collections', payload);
    return data;
  },
  updateCollection: async (id: string, payload: Partial<Collection>) => {
    const { data } = await axios.put(`/admin/products/collections/${id}`, payload);
    return data;
  },
  deleteCollection: async (id: string) => {
    const { data } = await axios.delete(`/admin/products/collections/${id}`);
    return data;
  },
};