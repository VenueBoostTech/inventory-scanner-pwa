import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { MapPin, Info } from 'lucide-react';
import { authStore } from '@/stores/authStore';

// Mock warehouse data
const mockWarehouses = [
  {
    id: '1',
    name: 'Main Warehouse',
    code: 'WH-001',
    address: 'Tirana',
  },
  {
    id: '2',
    name: 'Secondary Warehouse',
    code: 'WH-002',
    address: 'Durres',
  },
];

export function MyWarehousesScreen() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const profile = authStore((state) => state.profile);
  const warehouseIds = profile?.permissions?.warehouseIds || [];

  // Filter warehouses based on user's access
  const accessibleWarehouses = mockWarehouses.filter((wh) => warehouseIds.includes(wh.id) || warehouseIds.length === 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title="My Warehouses" showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">My Warehouses</h1>
          <p className="text-sm text-muted-foreground">Warehouses you have access to</p>
        </div>
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Warehouses I can access:</h3>
            <div className="space-y-3">
              {accessibleWarehouses.length > 0 ? (
                accessibleWarehouses.map((warehouse) => (
                  <div key={warehouse.id} className="flex items-start gap-3 rounded-lg border border-border bg-white p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945]/10">
                      <MapPin className="h-5 w-5 text-[#164945]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{warehouse.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {warehouse.code} • {warehouse.address}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No warehouses assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 bg-blue-50/50 shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-xs text-blue-900">
                Contact your admin to get access to more warehouses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
