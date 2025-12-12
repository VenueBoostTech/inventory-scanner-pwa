import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/lib/i18n';
import { AppShell } from '@/components/layout/AppShell';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { ScanScreen } from '@/features/scanning/ScanScreen';
import { ScanResultScreen } from '@/features/scanning/ScanResultScreen';
import { SearchProductsScreen } from '@/features/scanning/SearchProductsScreen';
import { CreateProductFromScanScreen } from '@/features/scanning/CreateProductFromScanScreen';
import { LinkSuccessScreen } from '@/features/scanning/LinkSuccessScreen';
import { CreateSuccessScreen } from '@/features/scanning/CreateSuccessScreen';
import { ProductsScreen } from '@/features/products/ProductsScreen';
import { ProductDetailsScreen } from '@/features/products/ProductDetailsScreen';
import { EditProductScreen } from '@/features/products/EditProductScreen';
import { LinkBarcodeScreen } from '@/features/products/LinkBarcodeScreen';
import { OperationsScreen } from '@/features/activities/OperationsScreen';
import { ActivitiesScreen } from '@/features/activities/ActivitiesScreen';
import { TransfersScreen } from '@/features/transfers/TransfersScreen';
import { TransferDetailsScreen } from '@/features/transfers/TransferDetailsScreen';
import { AdjustmentsScreen } from '@/features/adjustments/AdjustmentsScreen';
import { AdjustmentDetailsScreen } from '@/features/adjustments/AdjustmentDetailsScreen';
import { CountsScreen } from '@/features/counts/CountsScreen';
import { CountingScreen } from '@/features/counts/CountingScreen';
import { CountDetailsScreen } from '@/features/counts/CountDetailsScreen';
import { CountReportScreen } from '@/features/counts/CountReportScreen';
import { WarehousesScreen } from '@/features/warehouses/WarehousesScreen';
import { ProfileScreen } from '@/features/auth/ProfileScreen';
import { RecentLoginsScreen } from '@/features/auth/RecentLoginsScreen';
import { MyPermissionsScreen } from '@/features/auth/MyPermissionsScreen';
import { MyWarehousesScreen } from '@/features/auth/MyWarehousesScreen';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { NotificationsScreen } from '@/features/notifications/NotificationsScreen';
import { NotificationSettingsScreen } from '@/features/notifications/NotificationSettingsScreen';
import { authStore } from '@/stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardScreen />} />
            <Route path="scan" element={<ScanScreen />} />
            <Route path="scan/result" element={<ScanResultScreen />} />
            <Route path="scan/search" element={<SearchProductsScreen />} />
            <Route path="scan/create-product" element={<CreateProductFromScanScreen />} />
            <Route path="scan/link-success" element={<LinkSuccessScreen />} />
            <Route path="scan/create-success" element={<CreateSuccessScreen />} />
            <Route path="products" element={<ProductsScreen />} />
            <Route path="products/:id" element={<ProductDetailsScreen />} />
            <Route path="products/:id/edit" element={<EditProductScreen />} />
            <Route path="products/:id/link-barcode" element={<LinkBarcodeScreen />} />
            <Route path="operations" element={<OperationsScreen />} />
            <Route path="operations/activities" element={<ActivitiesScreen />} />
            <Route path="operations/transfers" element={<TransfersScreen />} />
            <Route path="operations/transfers/:id" element={<TransferDetailsScreen />} />
            <Route path="operations/adjustments" element={<AdjustmentsScreen />} />
            <Route path="operations/adjustments/:id" element={<AdjustmentDetailsScreen />} />
            <Route path="operations/counts" element={<CountsScreen />} />
            <Route path="operations/counts/:id/report" element={<CountReportScreen />} />
            <Route path="operations/counts/:id/counting" element={<CountingScreen />} />
            <Route path="operations/counts/:id" element={<CountDetailsScreen />} />
            <Route path="operations/warehouses" element={<WarehousesScreen />} />
            <Route path="notifications" element={<NotificationsScreen />} />
            <Route path="notifications/settings" element={<NotificationSettingsScreen />} />
            <Route path="account" element={<ProfileScreen />} />
            <Route path="account/recent-logins" element={<RecentLoginsScreen />} />
            <Route path="account/permissions" element={<MyPermissionsScreen />} />
            <Route path="account/warehouses" element={<MyWarehousesScreen />} />
          </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </QueryClientProvider>
    </I18nProvider>
  );
}

export default App;
