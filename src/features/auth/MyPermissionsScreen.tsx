import { useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { authStore } from '@/stores/authStore';

// Helper function to flatten features object into a list
function flattenFeatures(features: any, prefix = ''): Array<{ key: string; label: string; value: boolean }> {
  const items: Array<{ key: string; label: string; value: boolean }> = [];

  for (const [key, value] of Object.entries(features)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'boolean') {
      // Convert key to readable label
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      items.push({ key: fullKey, label, value });
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively process nested objects
      items.push(...flattenFeatures(value, fullKey));
    }
  }

  return items;
}

export function MyPermissionsScreen() {
  const { t } = useI18n();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const profile = authStore((state) => state.profile);
  const inventoryAccess = authStore((state) => state.inventoryAccess);
  const permissions = profile?.permissions;

  // Staff-level permissions
  const staffPermissionItems = [
    { key: 'canScan', label: t('auth.permissions.scanProducts'), value: permissions?.canScan ?? false },
    { key: 'canAdjustStock', label: t('auth.permissions.adjustStock'), value: permissions?.canAdjustStock ?? false },
    {
      key: 'canPerformStockCount',
      label: t('auth.permissions.performStockCounts'),
      value: permissions?.canPerformStockCount ?? false,
    },
    {
      key: 'canInitiateTransfer',
      label: t('auth.permissions.initiateTransfers'),
      value: permissions?.canInitiateTransfer ?? false,
    },
    {
      key: 'canCompleteTransfer',
      label: t('auth.permissions.completeTransfers'),
      value: permissions?.canCompleteTransfer ?? false,
    },
    { key: 'canAddProducts', label: t('auth.permissions.addProducts'), value: permissions?.canAddProducts ?? false },
    { key: 'canEditProducts', label: t('auth.permissions.editProducts'), value: permissions?.canEditProducts ?? false },
  ];

  // Platform-level features (dynamic)
  const featureItems = useMemo(() => {
    if (!inventoryAccess?.features) return [];
    return flattenFeatures(inventoryAccess.features);
  }, [inventoryAccess?.features]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('auth.permissions.title')} showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">{t('auth.permissions.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('auth.permissions.subtitle')}</p>
        </div>

        {/* Staff Permissions */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t('auth.permissions.whatICanDo')}</h3>
            <div className="space-y-3">
              {staffPermissionItems.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  {item.value ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Features (Dynamic) */}
        {featureItems.length > 0 && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-4">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Platform Features</h3>
              <div className="space-y-3">
                {featureItems.map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    {item.value ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border border-blue-200 bg-blue-50/50 shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-xs text-blue-900">
                {t('auth.permissions.contactAdmin')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
