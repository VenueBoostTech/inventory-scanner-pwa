import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface ProductWarehouse {
  id: string;
  name: string;
  code: string;
  currentStock: number;
}

export interface ProductWarehousesResponse {
  productId: string;
  warehouses: ProductWarehouse[];
}

export function useProductWarehouses(productId: string | null | undefined) {
  return useQuery({
    queryKey: ['product-warehouses', productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data } = await apiClient.get<ProductWarehousesResponse>(
        `/products/${productId}/warehouses`
      );
      return data;
    },
    enabled: !!productId,
  });
}


