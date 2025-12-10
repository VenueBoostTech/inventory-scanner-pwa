import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product } from '@/types/api';

export function useProducts(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get('/products', { params });
      return data as Product[];
    },
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}`);
      return data as Product;
    },
  });
}

export function useScanBarcode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (barcode: string) => {
      const { data } = await api.post('/scan', { barcode });
      return data as Product | null;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

