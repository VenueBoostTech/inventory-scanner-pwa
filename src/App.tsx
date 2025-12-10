import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/lib/i18n';
import { AppShell } from '@/components/layout/AppShell';
import { LoginScreen } from '@/features/auth/LoginScreen';
import { ScanScreen } from '@/features/scanning/ScanScreen';
import { ProductsScreen } from '@/features/products/ProductsScreen';
import { OperationsScreen } from '@/features/activities/OperationsScreen';
import { ActivitiesScreen } from '@/features/activities/ActivitiesScreen';
import { TransfersScreen } from '@/features/transfers/TransfersScreen';
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
            <Route path="products" element={<ProductsScreen />} />
            <Route path="operations" element={<OperationsScreen />} />
            <Route path="operations/activities" element={<ActivitiesScreen />} />
            <Route path="operations/transfers" element={<TransfersScreen />} />
            <Route path="operations/adjustments" element={<AdjustmentsScreen />} />
            <Route path="operations/adjustments/:id" element={<AdjustmentDetailsScreen />} />
            <Route path="operations/counts" element={<CountsScreen />} />
            <Route path="operations/counts/:id/report" element={<CountReportScreen />} />
            <Route path="operations/counts/:id/counting" element={<CountingScreen />} />
            <Route path="operations/counts/:id" element={<CountDetailsScreen />} />
            <Route path="operations/warehouses" element={<WarehousesScreen />} />
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
