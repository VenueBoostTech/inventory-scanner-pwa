import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

// Mock data
const mockAdjustments = [
  {
    id: 'adj_001',
    code: 'ADJ-001',
    product: { id: 'prod_001', title: 'Coffee Beans', sku: 'COF-001' },
    adjustmentType: 'increase',
    quantity: 50,
    stockBefore: 100,
    stockAfter: 150,
    reason: 'Received shipment',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: { id: 'staff_001', name: 'John D.' },
  },
  {
    id: 'adj_002',
    code: 'ADJ-002',
    product: { id: 'prod_002', title: 'Tea Bags', sku: 'TEA-001' },
    adjustmentType: 'decrease',
    quantity: -5,
    stockBefore: 80,
    stockAfter: 75,
    reason: 'Damaged items',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdBy: { id: 'staff_002', name: 'Sarah M.' },
  },
  {
    id: 'adj_003',
    code: 'ADJ-003',
    product: { id: 'prod_003', title: 'Sugar', sku: 'SUG-001' },
    adjustmentType: 'set',
    quantity: 200,
    stockBefore: 180,
    stockAfter: 200,
    reason: 'Inventory correction',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdBy: { id: 'staff_003', name: 'Mike T.' },
  },
];

export function AdjustmentsScreen() {
  const { t } = useI18n();
  const { toast } = useToast();

  const handleCreate = () => {
    toast({
      title: t('operations.newAdjustment'),
      description: t('common.loading'),
    });
    // TODO: Navigate to create adjustment screen
  };

  const getQuantityDisplay = (adjustment: any) => {
    if (adjustment.adjustmentType === 'set') {
      return `=${adjustment.quantity}`;
    }
    return adjustment.quantity > 0 ? `+${adjustment.quantity}` : `${adjustment.quantity}`;
  };

  const getQuantityColor = (adjustment: any) => {
    if (adjustment.adjustmentType === 'set') {
      return 'text-blue-600';
    }
    return adjustment.quantity > 0 ? 'text-emerald-600' : 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.stockAdjustments')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div></div>
          <Button
            size="sm"
            className="gap-2 border-none bg-[#164945] text-white hover:bg-[#123b37]"
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4" />
            {t('operations.new')}
          </Button>
        </div>

        {/* Adjustments List */}
        <div className="space-y-3">
          {mockAdjustments.map((adjustment) => (
            <Card key={adjustment.id} className="border border-border bg-white shadow-none">
              <CardContent className="px-3 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {adjustment.code}
                      </p>
                      <span className={`text-sm font-semibold ${getQuantityColor(adjustment)}`}>
                        {getQuantityDisplay(adjustment)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {adjustment.product.title} ({adjustment.product.sku})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('operations.reason')}: {adjustment.reason === 'Received shipment' ? t('operations.receivedShipment') : adjustment.reason === 'Damaged items' ? t('operations.damagedItems') : adjustment.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(adjustment.createdAt, 'MMM d, yyyy, h:mm a')} • {adjustment.createdBy.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('operations.stock')}: {adjustment.stockBefore} → {adjustment.stockAfter}
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
