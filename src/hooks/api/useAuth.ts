import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { authStore } from '@/stores/authStore';

export interface Profile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  clientId: string;
  clientName: string;
  permissions: {
    canScan: boolean;
    canAdjustStock: boolean;
    canPerformStockCount: boolean;
    canInitiateTransfer: boolean;
    canCompleteTransfer: boolean;
    canAddProducts: boolean;
    canEditProducts: boolean;
    canViewAllWarehouses: boolean;
    warehouseIds: string[];
  };
  features?: {
    stockAdjustments: boolean;
    stockCounts: boolean;
    stockTransfers: boolean;
    addProducts: boolean;
    editProducts: boolean;
    barcodeScanning: boolean;
    multiLanguage: boolean;
    offlineMode?: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    notificationsEnabled?: boolean;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    notificationsEnabled?: boolean;
  };
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<Profile>('/auth/profile');
      return data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: UpdateProfileRequest) => {
      const { data } = await apiClient.put<{ message: string; profile: Profile }>(
        '/auth/profile',
        updates
      );
      return data;
    },
    onSuccess: (data) => {
      // Update auth store
      authStore.getState().setProfile(data.profile);
      // Sync language if changed
      if (data.profile.preferences?.language) {
        localStorage.setItem('app-language', data.profile.preferences.language);
      }
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (request: ChangePasswordRequest) => {
      const { data } = await apiClient.post<{ message: string }>(
        '/auth/change-password',
        request
      );
      return data;
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ message: string }>('/auth/logout');
      return data;
    },
    onSuccess: () => {
      authStore.getState().logout();
      void queryClient.clear();
    },
  });
}
