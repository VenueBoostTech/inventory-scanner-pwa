import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Permissions {
  canScan: boolean;
  canAdjustStock: boolean;
  canPerformStockCount: boolean;
  canInitiateTransfer: boolean;
  canCompleteTransfer: boolean;
  canAddProducts: boolean;
  canEditProducts: boolean;
  canViewAllWarehouses: boolean;
  warehouseIds: string[];
}

export interface Features {
  stockAdjustments: boolean;
  stockCounts: boolean;
  stockTransfers: boolean;
  addProducts: boolean;
  editProducts: boolean;
  barcodeScanning: boolean;
  multiLanguage: boolean;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  clientId: string;
  clientName: string;
  permissions: Permissions;
  features: Features;
  preferences: {
    language: string;
    timezone: string;
  };
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setProfile: (profile: Profile) => void;
  logout: () => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      profile: null,
      isAuthenticated: false,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
      setProfile: (profile) => set({ profile }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          profile: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

