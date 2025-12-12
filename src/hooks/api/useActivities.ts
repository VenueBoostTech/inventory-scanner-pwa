import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Activity {
  id: string;
  activityType: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  source: string;
  product: {
    id: string;
    title: string;
    sku: string;
    imagePath?: string | null;
  };
  reference?: {
    type: string;
    id: string;
  } | null;
  staff?: {
    id: string;
    name: string;
  } | null;
  notes?: string | null;
  variantId?: string | null;
  createdAt: string;
}

export interface ActivityDetails extends Activity {
  // Additional fields for detailed view
}

export interface ActivitiesResponse {
  data: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActivitySummary {
  today: number;
  thisWeek: number;
  mobileActivities: number;
  byType: {
    adjustment: number;
    order_created: number;
    order_cancelled: number;
    initial_stock: number;
    sync: number;
  };
}

export interface OperationsOverview {
  summary: {
    transfers: {
      pending: number;
      inTransit: number;
      today: number;
      total: number;
    };
    stockCounts: {
      active: number;
      today: number;
      total: number;
    };
    adjustments: {
      today: number;
      thisWeek: number;
      total: number;
    };
    activities: {
      today: number;
      thisWeek: number;
      total: number;
    };
  };
  recent: {
    transfers: Array<{
      id: string;
      status: string;
      itemCount: number;
      fromWarehouse: string;
      toWarehouse: string;
      createdAt: string;
    }>;
    stockCounts: Array<{
      id: string;
      status: string;
      warehouseId: string;
      itemsCounted: number;
      totalItems: number;
      createdAt: string;
    }>;
    adjustments: Array<{
      id: string;
      product: {
        id: string;
        title: string;
        sku: string;
      };
      type: string;
      quantity: number;
      createdAt: string;
    }>;
  };
}

export function useActivities(params?: {
  page?: number;
  limit?: number;
  productId?: string;
  activityType?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivitiesResponse>('/activities', { params });
      return data;
    },
  });
}

export function useMyActivities(params?: {
  page?: number;
  limit?: number;
  activityType?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ['activities', 'mine', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivitiesResponse>('/activities/mine', { params });
      return data;
    },
  });
}

export function useActivity(activityId: string) {
  return useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivityDetails>(`/activities/${activityId}`);
      return data;
    },
  });
}

export function useActivitySummary() {
  return useQuery({
    queryKey: ['activity-summary'],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivitySummary>('/activities/summary/stats');
      return data;
    },
  });
}

export function useMyAdjustments(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['adjustments', 'mine', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivitiesResponse>('/activities/adjustments/mine', {
        params,
      });
      return data;
    },
  });
}

export function useOperationsOverview() {
  return useQuery({
    queryKey: ['operations-overview'],
    queryFn: async () => {
      const { data } = await apiClient.get<OperationsOverview>('/activities/operations/overview');
      return data;
    },
  });
}
