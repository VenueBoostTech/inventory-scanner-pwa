import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  addressDetails?: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
  stats?: {
    totalProducts: number;
    totalStock: number;
    inStockProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    missingBarcode: number;
  };
  totalProducts?: number;
  totalStock?: number;
  statsUpdatedAt?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface WarehouseStats {
  warehouseId: string;
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockValue: number;
}

export function useWarehouses(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Warehouse[]; pagination: any }>(
        '/warehouses',
        { params }
      );
      return data.data || data;
    },
  });
}

export function useWarehouse(warehouseId: string) {
  return useQuery({
    queryKey: ['warehouse', warehouseId],
    queryFn: async () => {
      const { data } = await apiClient.get<Warehouse>(`/warehouses/${warehouseId}`);
      return data;
    },
  });
}

export function useWarehouseStats(warehouseId: string) {
  return useQuery({
    queryKey: ['warehouse-stats', warehouseId],
    queryFn: async () => {
      const { data } = await apiClient.get<WarehouseStats>(`/warehouses/${warehouseId}/stats`);
      return data;
    },
  });
}
