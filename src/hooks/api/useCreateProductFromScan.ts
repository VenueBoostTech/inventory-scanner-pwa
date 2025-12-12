import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getDeviceInfo } from '@/lib/device';
import type { Product } from '@/types/api';

export interface CreateProductFromScanRequest {
  barcode: string;
  title: string;
  titleAl?: string;
  categoryId: string;
  brandId?: string;
  price: number;
  priceAl?: number;
  priceEur?: number;
  unitMeasure?: string;
  initialQuantity: number;
  warehouseId: string;
}

export interface CreateProductFromScanResponse {
  result: 'created';
  message: string;
  product: Product;
}

export function useCreateProductFromScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateProductFromScanRequest) => {
      const deviceInfo = getDeviceInfo();
      const { data } = await apiClient.post<CreateProductFromScanResponse>('/scan/add-product', {
        ...request,
        deviceInfo,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
