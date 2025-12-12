import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getDeviceInfo } from '@/lib/device';

export interface StockAdjustmentRequest {
  productId: string;
  adjustmentType: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: string;
  notes?: string;
  warehouseId?: string;
}

export interface StockAdjustmentResponse {
  message: string;
  adjustment: {
    id: string;
    productId: string;
    productName: string;
    adjustmentType: 'increase' | 'decrease' | 'set';
    quantity: number;
    stockBefore: number;
    stockAfter: number;
  };
}

export function useStockAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: StockAdjustmentRequest) => {
      const deviceInfo = getDeviceInfo();
      const { data } = await apiClient.post<StockAdjustmentResponse>('/stock/adjust', {
        ...request,
        deviceInfo,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate product queries to refresh stock
      void queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
