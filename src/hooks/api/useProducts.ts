import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { apiClient } from '@/lib/api-client';
import type { Product, ScanResult } from '@/types/api';

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
    mutationFn: async ({ barcode, warehouseId }: { barcode: string; warehouseId?: string }) => {
      const { data } = await apiClient.post<ScanResult>('/scan', { 
        barcode,
        warehouseId,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

