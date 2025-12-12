import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export type DateFilter = 'today' | 'yesterday' | 'this_week' | 'last_7_days' | 'this_month';

export interface FormattedDateTime {
  date: string;
  formattedDate: string;
  formattedTime: string;
  formattedDateTime: string;
  timezone: string;
  timestamp: number;
}

export interface RecentScan {
  id: string;
  productName: string;
  sku: string;
  barcode?: string;
  status: 'found' | 'not_found' | 'created';
  time: FormattedDateTime;
}

export interface RecentActivity {
  id: string;
  product: {
    id: string;
    name: string;
    name_al: string | null;
    sku: string;
  };
  variant: any | null;
  variant_id: string | null;
  activity_type: string;
  quantity: number;
  stock_before: number;
  stock_after: number;
  source: string;
  reference: {
    type: string;
    id: string;
  } | null;
  notes: string | null;
  created_by: {
    id: string;
    name: string;
  } | null;
  created_at: FormattedDateTime;
  type: 'adjustment' | 'count' | 'transfer';
  action: 'increase' | 'decrease' | 'completed';
  productName: string;
}

export interface DashboardData {
  stats: {
    scans: number;
    adjustments: number;
    stockCounts: number;
    transfers: number;
  };
  alerts: {
    outOfStock: number;
    lowStock: number;
  };
  recentScans: RecentScan[];
  recentActivities: RecentActivity[];
}

export function useDashboard(dateFilter: DateFilter = 'today') {
  return useQuery({
    queryKey: ['dashboard', dateFilter],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardData>('/dashboard', {
        params: { dateFilter },
      });
      return data;
    },
  });
}
