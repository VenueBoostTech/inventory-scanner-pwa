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

export interface LoginHistoryEntry {
  loginAt: FormattedDateTime | null;
  deviceInfo: {
    platform?: string;
    deviceModel?: string;
    appVersion?: string;
    deviceId?: string;
  };
  ipAddress?: string | null;
  isCurrentSession: boolean;
}

interface LoginHistoryResponse {
  data: LoginHistoryEntry[];
}

export function useLoginHistory() {
  return useQuery({
    queryKey: ['login-history'],
    queryFn: async () => {
      const { data } = await apiClient.get<LoginHistoryResponse>('/auth/login-history');
      return data.data;
    },
  });
}
