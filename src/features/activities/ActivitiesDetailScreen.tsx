import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import {
  Package,
  Truck,
  ClipboardList,
  Scan,
  Filter,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data
const mockActivities = [
  {
    id: 'act_001',
    activityType: 'ADJUSTMENT',
    quantity: -5,
    stockBefore: 155,
    stockAfter: 150,
    product: {
      id: 'prod_001',
      title: 'Coffee Beans',
      sku: 'COF-001',
    },
    staff: {
      id: 'staff_001',
      name: 'John Doe',
    },
    reason: 'Damaged',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'act_002',
    activityType: 'TRANSFER',
    quantity: 20,
    from: 'Main',
    to: 'Secondary Warehouse',
    staff: {
      id: 'staff_002',
      name: 'Sarah M.',
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'act_003',
    activityType: 'COUNT',
    warehouse: 'Main',
    itemsCounted: 150,
    discrepancies: 3,
    staff: {
      id: 'staff_003',
      name: 'Mike T.',
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'act_004',
    activityType: 'SCAN',
    product: {
      id: 'prod_002',
      title: 'Tea Bags',
      sku: 'TEA-001',
    },
    warehouse: 'Main',
    staff: {
      id: 'staff_003',
      name: 'Mike T.',
    },
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
  },
];

export function ActivitiesDetailScreen() {
  const { t } = useI18n();
  const [filter, setFilter] = useState('all');

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ADJUSTMENT':
        return Package;
      case 'TRANSFER':
        return Truck;
      case 'COUNT':
        return ClipboardList;
      case 'SCAN':
        return Scan;
      default:
        return Package;
    }
  };

  const getActivityTitle = (activity: any) => {
    switch (activity.activityType) {
      case 'ADJUSTMENT':
        return t('operations.stockAdjustment');
      case 'TRANSFER':
        return t('operations.transferCompleted');
      case 'COUNT':
        return t('operations.stockCountCompleted');
      case 'SCAN':
        return t('operations.productScanned');
      default:
        return activity.activityType;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.activities')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            {t('operations.filter')}
          </Button>
        </div>

        {/* Activities List */}
        <div className="space-y-3">
          {mockActivities.map((activity) => {
            const Icon = getActivityIcon(activity.activityType);
            return (
              <Card key={activity.id} className="border border-border bg-white shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {getActivityTitle(activity)}
                        </p>
                        {activity.activityType === 'ADJUSTMENT' && (
                          <span
                            className={`text-sm font-semibold ${
                              activity.quantity > 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {activity.quantity > 0 ? '+' : ''}
                            {activity.quantity} {t('operations.units')}
                          </span>
                        )}
                        {activity.activityType === 'TRANSFER' && (
                          <span className="text-sm font-semibold text-foreground">
                            {activity.quantity} {t('operations.units')}
                          </span>
                        )}
                      </div>

                      {activity.activityType === 'ADJUSTMENT' && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            {activity.product.title} ({activity.product.sku})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(activity.createdAt, 'MMM d, yyyy, h:mm a')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('operations.by')}: {activity.staff.name} • {t('operations.reason')}: {activity.reason}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('operations.stock')}: {activity.stockBefore} → {activity.stockAfter}
                          </p>
                        </>
                      )}

                      {activity.activityType === 'TRANSFER' && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            {activity.from} → {activity.to}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(activity.createdAt, 'MMM d, yyyy, h:mm a')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('operations.by')}: {activity.staff.name}
                          </p>
                        </>
                      )}

                      {activity.activityType === 'COUNT' && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            {t('operations.warehouse')}: {activity.warehouse} • {activity.itemsCounted} {t('operations.items')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(activity.createdAt, 'MMM d, yyyy, h:mm a')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('operations.discrepancies')}: {activity.discrepancies} {t('operations.items')}
                          </p>
                        </>
                      )}

                      {activity.activityType === 'SCAN' && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            {activity.product.title} ({activity.product.sku})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(activity.createdAt, 'MMM d, yyyy, h:mm a')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('operations.by')}: {activity.staff.name} • {t('operations.warehouse')}: {activity.warehouse}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        <Button variant="outline" className="w-full">
          {t('operations.loadMore')}
        </Button>
      </div>
    </div>
  );
}
