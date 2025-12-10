import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import { Warehouse, Search } from 'lucide-react';

// Mock data
const mockWarehouses = [
  {
    id: 'wh_001',
    name: 'Main Warehouse',
    address: '123 Industrial Zone, Tirana',
    stats: {
      totalProducts: 1250,
      totalStock: 45000,
      lowStockProducts: 45,
      outOfStockProducts: 12,
      missingBarcode: 85,
    },
  },
];

export function WarehousesScreen() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.warehouses')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t('operations.warehouses')}</h1>
          <p className="text-sm text-muted-foreground">{t('operations.warehousesSubtitle')}</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('operations.searchWarehouses')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Warehouses List */}
        <div className="space-y-3">
          {mockWarehouses.map((warehouse) => (
            <Card key={warehouse.id} className="border border-border bg-white shadow-none">
              <CardContent className="px-3 py-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Warehouse className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-foreground">{warehouse.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{warehouse.address}</p>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <Card className="border border-border bg-muted/30 shadow-none">
                      <CardContent className="px-2 py-2 text-center">
                        <div className="text-lg font-bold text-foreground">
                          {warehouse.stats.totalProducts.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-tight">
                          {t('operations.totalProducts')}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-border bg-muted/30 shadow-none">
                      <CardContent className="px-2 py-2 text-center">
                        <div className="text-lg font-bold text-foreground">
                          {warehouse.stats.lowStockProducts}
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-tight">
                          {t('operations.lowStock')}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-border bg-muted/30 shadow-none">
                      <CardContent className="px-2 py-2 text-center">
                        <div className="text-lg font-bold text-foreground">
                          {warehouse.stats.outOfStockProducts}
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-tight">
                          {t('operations.outStock')}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {t('operations.totalUnits')}: {warehouse.stats.totalStock.toLocaleString()} {t('operations.units')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('operations.missingBarcode')}: {warehouse.stats.missingBarcode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
