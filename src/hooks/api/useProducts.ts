import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Product, ScanResult } from '@/types/api';

export function useProducts(params?: { 
  page?: number; 
  limit?: number; 
  search?: string;
  categoryId?: string;
  stockStatus?: string;
  hasBarcode?: boolean;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Product[] }>('/products', { params });
      return data.data || data;
    },
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data } = await apiClient.get<Product>(`/products/${productId}`);
      return data;
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, ...updates }: { productId: string; [key: string]: any }) => {
      const { data } = await apiClient.put<{ message: string; product: Product }>(
        `/products/${productId}`,
        updates
      );
      return data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
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

