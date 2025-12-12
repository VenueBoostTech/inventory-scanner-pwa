import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Product } from '@/types/api';

export interface ScanSearchRequest {
  searchTerm: string;
  originalBarcode?: string;
  warehouseId?: string;
  deviceInfo?: {
    platform: string;
    deviceModel: string;
    appVersion: string;
    deviceId?: string;
  };
}

export interface ScanSearchResponse {
  result: 'found' | 'not_found';
  message: string;
  searchTerm: string;
  originalBarcode?: string;
  count: number;
  products: Array<Product & {
    hasBarcode: boolean;
  }>;
}

export function useScanSearch() {
  return useMutation({
    mutationFn: async (request: ScanSearchRequest) => {
      const { data } = await apiClient.post<ScanSearchResponse>('/scan/search', request);
      return data;
    },
  });
}
