import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Info } from 'lucide-react';
import { authStore } from '@/stores/authStore';

export function MyWarehousesScreen() {
  const { t } = useI18n();
  
  const profile = authStore((state) => state.profile);
  const warehouseIds = profile?.permissions?.warehouseIds || [];
  const { data: warehouses = [], isLoading } = useWarehouses({ limit: 100 });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter warehouses based on user's access
  const accessibleWarehouses = warehouses.filter((wh) => 
    warehouseIds.length === 0 || warehouseIds.includes(wh.id)
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('auth.warehouses.title')} showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">{t('auth.warehouses.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('auth.warehouses.subtitle')}</p>
        </div>
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t('auth.warehouses.warehousesICanAccess')}</h3>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-white p-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))
              ) : accessibleWarehouses.length > 0 ? (
                accessibleWarehouses.map((warehouse) => (
                  <div key={warehouse.id} className="flex items-start gap-3 rounded-lg border border-border bg-white p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945]/10">
                      <MapPin className="h-5 w-5 text-[#164945]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{warehouse.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {warehouse.code} {warehouse.address && `• ${warehouse.address}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('auth.warehouses.noWarehouses')}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 bg-blue-50/50 shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-xs text-blue-900">
                {t('auth.warehouses.contactAdmin')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
