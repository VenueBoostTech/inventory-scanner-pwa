import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { authStore } from '@/stores/authStore';

export function MyPermissionsScreen() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const profile = authStore((state) => state.profile);
  const permissions = profile?.permissions;

  const permissionItems = [
    { key: 'canScan', label: 'Scan products', value: permissions?.canScan ?? false },
    { key: 'canAdjustStock', label: 'Adjust stock', value: permissions?.canAdjustStock ?? false },
    {
      key: 'canPerformStockCount',
      label: 'Perform stock counts',
      value: permissions?.canPerformStockCount ?? false,
    },
    {
      key: 'canInitiateTransfer',
      label: 'Initiate transfers',
      value: permissions?.canInitiateTransfer ?? false,
    },
    {
      key: 'canCompleteTransfer',
      label: 'Complete transfers',
      value: permissions?.canCompleteTransfer ?? false,
    },
    { key: 'canAddProducts', label: 'Add new products', value: permissions?.canAddProducts ?? false },
    { key: 'canEditProducts', label: 'Edit products', value: permissions?.canEditProducts ?? false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title="My Permissions" showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">My Permissions</h1>
          <p className="text-sm text-muted-foreground">View what actions you can perform in the system</p>
        </div>
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">What I can do:</h3>
            <div className="space-y-3">
              {permissionItems.map((item) => (
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

        <Card className="border border-blue-200 bg-blue-50/50 shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-xs text-blue-900">
                Contact your admin to change permissions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
