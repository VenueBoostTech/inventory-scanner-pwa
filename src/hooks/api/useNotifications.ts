import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Notification {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'transfer' | 'count' | 'adjustment' | 'approval';
  title: string;
  message: string;
  isRead: boolean;
  data?: {
    productId?: string;
    productName?: string;
    currentStock?: number;
    threshold?: number;
    transferId?: string;
    countId?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export function useNotifications(params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Notification[]; pagination?: any }>(
        '/notifications',
        { params }
      );
      return data.data || data;
    },
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
      return data.count || 0;
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await apiClient.put<{ message: string }>(
        `/notifications/${notificationId}/read`
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.put<{ message: string }>('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

