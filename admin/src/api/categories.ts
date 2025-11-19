import axios from '@/utils/axios';
import { Category } from '@/types';

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const { data } = await axios.get('/products/getAllCategories');
    return data.data;
  },
  createCategory: async (payload: Partial<Category>) => {
    const { data } = await axios.post('/admin/products/categories', payload);
    return data;
  },
  updateCategory: async (id: string, payload: Partial<Category>) => {
    const { data } = await axios.put(`/admin/products/categories/${id}`, payload);
    return data;
  },
  deleteCategory: async (id: string) => {
    const { data } = await axios.delete(`/admin/products/categories/${id}`);
    return data;
  },
};