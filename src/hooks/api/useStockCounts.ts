import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getDeviceInfo } from '@/lib/device';

export interface StockCount {
  id: string;
  referenceNumber: string;
  warehouse: {
    id: string;
    name: string;
    code: string;
  };
  performedBy?: {
    id: string;
    name: string;
  };
  status: 'in_progress' | 'completed' | 'cancelled';
  totalItemsCounted?: number;
  totalVariance?: number;
  itemsWithVariance?: number;
  startedAt?: string;
  completedAt?: string;
  items?: Array<{
    productId: string;
    productSku: string;
    productName: string;
    expectedQuantity: number;
    countedQuantity: number;
    variance: number;
    notes?: string;
    countedAt?: string;
  }>;
  notes?: string;
  autoAdjusted?: boolean;
}

export interface CreateStockCountRequest {
  warehouseId: string;
  notes?: string;
}

export interface UpdateStockCountRequest {
  items: Array<{
    productId: string;
    countedQuantity: number;
    notes?: string;
  }>;
}

export interface CompleteStockCountRequest {
  autoAdjust: boolean;
  notes?: string;
}

export function useStockCounts(params?: {
  page?: number;
  limit?: number;
  warehouseId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['stock-counts', params],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: StockCount[]; pagination: any }>(
        '/stock/counts',
        { params }
      );
      return data;
    },
  });
}

export function useStockCount(countId: string) {
  return useQuery({
    queryKey: ['stock-count', countId],
    queryFn: async () => {
      const { data } = await apiClient.get<StockCount>(`/stock/counts/${countId}`);
      return data;
    },
  });
}

export function useCreateStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateStockCountRequest) => {
      const deviceInfo = getDeviceInfo();
      const { data } = await apiClient.post<{ message: string; stockCount: StockCount }>(
        '/stock/counts',
        { ...request, deviceInfo }
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stock-counts'] });
    },
  });
}

export function useUpdateStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ countId, ...request }: { countId: string } & UpdateStockCountRequest) => {
      const { data } = await apiClient.put<{ message: string; stockCount: StockCount }>(
        `/stock/counts/${countId}`,
        request
      );
      return data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['stock-count', variables.countId] });
      void queryClient.invalidateQueries({ queryKey: ['stock-counts'] });
    },
  });
}

export function useCompleteStockCount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ countId, ...request }: { countId: string } & CompleteStockCountRequest) => {
      const { data } = await apiClient.post<{ message: string; stockCount: StockCount }>(
        `/stock/counts/${countId}/complete`,
        request
      );
      return data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['stock-count', variables.countId] });
      void queryClient.invalidateQueries({ queryKey: ['stock-counts'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
