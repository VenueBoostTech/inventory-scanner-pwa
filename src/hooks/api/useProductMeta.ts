import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Category {
  id: string;
  name?: string;
  nameAl?: string | null;
  // Hierarchical format fields
  title?: string;
  title_al?: string;
  parent_id?: string | null;
  children?: Category[];
  products_count?: number;
}

export interface Brand {
  id: string;
  name: string;
}

export function useCategories(includeChildren?: boolean) {
  return useQuery({
    queryKey: ['categories', includeChildren],
    queryFn: async () => {
      const params = includeChildren ? { include_children: 'true' } : undefined;
      const { data } = await apiClient.get<{ data: Category[] }>('/products/meta/categories', { params });
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
