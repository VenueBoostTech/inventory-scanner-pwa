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
  offlineMode: boolean;
  printLabels: boolean;
  batchScanning: boolean;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  clientId: string;
  clientName: string;
  permissions: Permissions;
  features: Features;
  preferences: {
    language: string;
    timezone: string;
    notificationsEnabled?: boolean;
  };
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string, expiresAt?: number) => void;
  setProfile: (profile: Profile) => void;
  logout: () => void;
  getClientIdentifier: () => string | null;
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      profile: null,
      isAuthenticated: false,
      setTokens: (access, refresh, expiresAt) => {
        const expiresAtTimestamp = expiresAt || (Date.now() + 3600 * 1000); // Default 1 hour
        set({
          accessToken: access,
          refreshToken: refresh,
          tokenExpiresAt: expiresAtTimestamp,
          isAuthenticated: true,
        });
      },
      setProfile: (profile) => {
        set({ profile });
        // Sync language preference with i18n
        if (profile.preferences?.language) {
          localStorage.setItem('app-language', profile.preferences.language);
        }
      },
      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
          profile: null,
          isAuthenticated: false,
        });
        // Clear language preference
        localStorage.removeItem('app-language');
      },
      getClientIdentifier: () => {
        const profile = get().profile;
        return profile?.clientId || null;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenExpiresAt: state.tokenExpiresAt,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

