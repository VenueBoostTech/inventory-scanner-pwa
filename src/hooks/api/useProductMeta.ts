import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Category {
  id: string;
  name: string;
  nameAl?: string | null;
}

export interface Brand {
  id: string;
  name: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Category[] }>('/products/meta/categories');
      return data.data || data;
    },
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Brand[] }>('/products/meta/brands');
      return data.data || data;
    },
  });
}

export function useProductBySku(sku: string) {
  return useQuery({
    queryKey: ['product-sku', sku],
    queryFn: async () => {
      const { data } = await apiClient.get(`/products/sku/${sku}`);
      return data;
    },
    enabled: !!sku,
  });
}
