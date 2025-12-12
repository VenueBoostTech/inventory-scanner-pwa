import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface FormattedDateTime {
  date: string;
  formattedDate: string;
  formattedTime: string;
  formattedDateTime: string;
  timezone: string;
  timestamp: number;
}

export interface ScanHistoryEntry {
  id: string;
  barcode: string;
  action: string;
  result: string;
  quantity?: number;
  product?: {
    id: string;
    title: string;
    sku: string;
    imagePath?: string | null;
  };
  warehouse?: {
    id: string;
    name: string;
    code: string;
  };
  scannedAt: FormattedDateTime;
}

export interface ScanHistoryResponse {
  data: ScanHistoryEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ScanStats {
  today: number;
  thisWeek: number;
  total: number;
  byResult: {
    found: number;
    notFound: number;
    created: number;
  };
}

export function useScanHistory(params?: {
  page?: number;
  limit?: number;
  warehouseId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['scan-history', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ScanHistoryResponse>('/scan/history', { params });
      return data;
    },
  });
}

export function useScanStats() {
  return useQuery({
    queryKey: ['scan-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<ScanStats>('/scan/stats');
      return data;
    },
  });
}
