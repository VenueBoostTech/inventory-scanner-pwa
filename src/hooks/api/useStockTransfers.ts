import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { getDeviceInfo } from '@/lib/device';

export interface StockTransfer {
  id: string;
  referenceNumber: string;
  sourceWarehouse: {
    id: string;
    name: string;
    code: string;
  };
  destinationWarehouse: {
    id: string;
    name: string;
    code: string;
  };
  initiatedBy?: {
    id: string;
    name: string;
  };
  completedBy?: {
    id: string;
    name: string;
  } | null;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  totalItems?: number;
  totalQuantity?: number;
  items?: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    receivedQuantity?: number;
  }>;
  initiatedAt?: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface CreateTransferRequest {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
}

export interface CompleteTransferRequest {
  receivedItems: Array<{
    productId: string;
    receivedQuantity: number;
  }>;
  notes?: string;
}

export function useStockTransfers(params?: {
  page?: number;
  limit?: number;
  warehouseId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['stock-transfers', params],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: StockTransfer[]; pagination: any }>(
        '/stock/transfers',
        { params }
      );
      return data;
    },
  });
}

export function useStockTransfer(transferId: string) {
  return useQuery({
    queryKey: ['stock-transfer', transferId],
    queryFn: async () => {
      const { data } = await apiClient.get<StockTransfer>(`/stock/transfers/${transferId}`);
      return data;
    },
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateTransferRequest) => {
      const deviceInfo = getDeviceInfo();
      const { data } = await apiClient.post<{ message: string; transfer: StockTransfer }>(
        '/stock/transfers',
        { ...request, deviceInfo }
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useCompleteTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ transferId, ...request }: { transferId: string } & CompleteTransferRequest) => {
      const { data } = await apiClient.post<{ message: string; transfer: StockTransfer }>(
        `/stock/transfers/${transferId}/complete`,
        request
      );
      return data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['stock-transfer', variables.transferId] });
      void queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      void queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useCancelTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transferId: string) => {
      const { data } = await apiClient.post<{ message: string }>(
        `/stock/transfers/${transferId}/cancel`
      );
      return data;
    },
    onSuccess: (_, transferId) => {
      void queryClient.invalidateQueries({ queryKey: ['stock-transfer', transferId] });
      void queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
    },
  });
}
