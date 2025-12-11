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

// Client-level features structure
export interface ProductFeatures {
  enabled: boolean;
  view: boolean;
  viewDetails: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  bulkImport: boolean;
  bulkExport: boolean;
  linkBarcode: boolean;
  unlinkBarcode: boolean;
  manageImages: boolean;
  managePricing: boolean;
  manageCategories: boolean;
  manageBrands: boolean;
}

export interface StockAdjustmentFeatures {
  enabled: boolean;
  add: boolean;
  remove: boolean;
  set: boolean;
  bulkAdjust: boolean;
  viewHistory: boolean;
  requireReason: boolean;
  requireNotes: boolean;
}

export interface StockCountFeatures {
  enabled: boolean;
  create: boolean;
  perform: boolean;
  complete: boolean;
  cancel: boolean;
  viewHistory: boolean;
  exportResults: boolean;
}

export interface StockTransferFeatures {
  enabled: boolean;
  create: boolean;
  initiate: boolean;
  markInTransit: boolean;
  complete: boolean;
  cancel: boolean;
  viewHistory: boolean;
  viewAllWarehouses: boolean;
}

export interface StockReservationFeatures {
  enabled: boolean;
  create: boolean;
  release: boolean;
  view: boolean;
}

export interface ScanningFeatures {
  enabled: boolean;
  barcodeScan: boolean;
  qrCodeScan: boolean;
  manualEntry: boolean;
  continuousScan: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  flashEnabled: boolean;
}

export interface WarehouseFeatures {
  enabled: boolean;
  view: boolean;
  viewAll: boolean;
  switch: boolean;
  viewDetails: boolean;
  manageLocations: boolean;
}

export interface ReportFeatures {
  enabled: boolean;
  viewDashboard: boolean;
  viewActivities: boolean;
  viewStockReports: boolean;
  viewMovementReports: boolean;
  viewCountReports: boolean;
  viewTransferReports: boolean;
  exportData: boolean;
  viewAnalytics: boolean;
}

export interface OfflineFeatures {
  enabled: boolean;
  syncEnabled: boolean;
  autoSync: boolean;
  manualSync: boolean;
  conflictResolution: 'server_wins' | 'client_wins' | 'manual';
}

export interface SettingsFeatures {
  enabled: boolean;
  viewProfile: boolean;
  editProfile: boolean;
  changePassword: boolean;
  managePreferences: boolean;
  viewPermissions: boolean;
  viewWarehouses: boolean;
  viewRecentLogins: boolean;
}

export interface NotificationFeatures {
  enabled: boolean;
  lowStockAlerts: boolean;
  outOfStockAlerts: boolean;
  transferNotifications: boolean;
  countReminders: boolean;
  activityDigest: boolean;
}

export interface LocalizationFeatures {
  enabled: boolean;
  languages: string[];
  defaultLanguage: string;
  allowLanguageSwitch: boolean;
}

export interface AdvancedFeatures {
  enabled: boolean;
  apiAccess: boolean;
  webhookIntegration: boolean;
  customFields: boolean;
  auditLog: boolean;
  dataExport: boolean;
  dataImport: boolean;
}

export interface InventoryAccessFeatures {
  products: ProductFeatures;
  stock: {
    adjustments: StockAdjustmentFeatures;
    counts: StockCountFeatures;
    transfers: StockTransferFeatures;
    reservations: StockReservationFeatures;
  };
  scanning: ScanningFeatures;
  warehouses: WarehouseFeatures;
  reports: ReportFeatures;
  offline: OfflineFeatures;
  settings: SettingsFeatures;
  notifications: NotificationFeatures;
  localization: LocalizationFeatures;
  advanced: AdvancedFeatures;
}

export interface InventoryAccess {
  enabled: boolean;
  mobileApp: boolean;
  webApp?: boolean;
  webAppUrl?: string;
  customAppName: string | null;
  customVersion: string | null;
  expiresAt: string | null;
  features: InventoryAccessFeatures;
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
  preferences: {
    language: string;
    timezone: string;
    notificationsEnabled?: boolean;
  };
}

export interface Client {
  id: string;
  name: string;
  code: string;
  publicIdentifier: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: number | null;
  profile: Profile | null;
  client: Client | null;
  inventoryAccess: InventoryAccess | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string, expiresAt?: number) => void;
  setAuthData: (profile: Profile, client: Client, inventoryAccess: InventoryAccess) => void;
  setProfile: (profile: Profile) => void; // For backward compatibility, updates profile only
  logout: () => void;
  getClientIdentifier: () => string | null;
  // Permission check helpers (two-layer system)
  canAddProduct: () => boolean;
  canEditProduct: () => boolean;
  canDeleteProduct: () => boolean;
  canAdjustStock: () => boolean;
  canPerformStockCount: () => boolean;
  canInitiateTransfer: () => boolean;
  canCompleteTransfer: () => boolean;
  canScan: () => boolean;
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      profile: null,
      client: null,
      inventoryAccess: null,
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
      setAuthData: (profile, client, inventoryAccess) => {
        set({ profile, client, inventoryAccess });
        // Sync language preference with i18n
        if (profile.preferences?.language) {
          localStorage.setItem('app-language', profile.preferences.language);
        }
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
          client: null,
          inventoryAccess: null,
          isAuthenticated: false,
        });
        // Clear language preference
        localStorage.removeItem('app-language');
      },
      getClientIdentifier: () => {
        const client = get().client;
        return client?.publicIdentifier || null;
      },
      // Two-layer permission checks
      canAddProduct: () => {
        const features = get().inventoryAccess?.features;
        const permissions = get().profile?.permissions;
        return !!(
          features?.products.enabled &&
          features?.products.add &&
          permissions?.canAddProducts
        );
      },
      canEditProduct: () => {
        const features = get().inventoryAccess?.features;
        const permissions = get().profile?.permissions;
        return !!(
          features?.products.enabled &&
          features?.products.edit &&
          permissions?.canEditProducts
        );
      },
      canDeleteProduct: () => {
        const features = get().inventoryAccess?.features;
        return !!(
          features?.products.enabled &&
          features?.products.delete
        );
      },
      canAdjustStock: () => {
        const features = get().inventoryAccess?.features;
        const permissions = get().profile?.permissions;
        return !!(
          features?.stock.adjustments.enabled &&
          features?.stock.adjustments.add &&
          permissions?.canAdjustStock
        );
      },
      canPerformStockCount: () => {
        const features = get().inventoryAccess?.features;
        const permissions = get().profile?.permissions;
        return !!(
          features?.stock.counts.enabled &&
          features?.stock.counts.perform &&
          permissions?.canPerformStockCount
        );
      },
      canInitiateTransfer: () => {
        const features = get().inventoryAccess?.features;
        const permissions = get().profile?.permissions;
        return !!(
          features?.stock.transfers.enabled &&
          features?.stock.transfers.initiate &&
          permissions?.canInitiateTransfer
        );
      },
      canCompleteTransfer: () => {
        const features = get().inventoryAccess?.features;
        const permissions = get().profile?.permissions;
        return !!(
          features?.stock.transfers.enabled &&
          features?.stock.transfers.complete &&
          permissions?.canCompleteTransfer
        );
      },
      canScan: () => {
        const features = get().inventoryAccess?.features;
        const permissions = get().profile?.permissions;
        return !!(
          features?.scanning.enabled &&
          features?.scanning.barcodeScan &&
          permissions?.canScan
        );
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
        client: state.client,
        inventoryAccess: state.inventoryAccess,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

