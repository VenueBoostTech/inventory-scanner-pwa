import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { useActivity } from '@/hooks/api/useActivities';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

export function AdjustmentDetailsScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();

  const { data: activity, isLoading } = useActivity(id || '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('operations.stockAdjustments')} showBack />
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('operations.stockAdjustments')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  // Infer adjustment type from quantity
  const adjustmentType = activity.stockAfter === activity.quantity && activity.stockBefore !== activity.quantity
    ? 'set'
    : activity.quantity > 0
    ? 'increase'
    : 'decrease';

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'increase':
        return t('operations.increase');
      case 'decrease':
        return t('operations.decrease');
      case 'set':
        return t('operations.set');
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return TrendingUp;
      case 'decrease':
        return TrendingDown;
      case 'set':
        return Minus;
      default:
        return Package;
    }
  };

  const TypeIcon = getTypeIcon(adjustmentType);

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={`${t('operations.stockAdjustments')} #${activity.id.slice(0, 8)}`} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t('operations.stockAdjustments')} #{activity.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-muted-foreground">{t('operations.adjustmentDetails')}</p>
        </div>

        {/* Product Info */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">{t('operations.product')}</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{activity.product.title}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground pl-6">
                  <div>
                    <span className="font-medium">SKU:</span> {adjustment.product.sku}
                  </div>
                  <div>
                    <span className="font-medium">{t('operations.barcode')}:</span> {adjustment.product.barcode}
                  </div>
                  <div>
                    <span className="font-medium">{t('operations.category')}:</span> {adjustment.product.category}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adjustment Details */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{t('operations.adjustmentDetails')}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.adjustmentType')}</p>
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{getTypeLabel(adjustmentType)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.quantity')}</p>
                  <span className={`text-sm font-semibold ${
                    adjustmentType === 'set' 
                      ? 'text-blue-600' 
                      : activity.quantity > 0 
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {adjustmentType === 'set' ? '=' : activity.quantity > 0 ? '+' : ''}
                    {activity.quantity} {t('operations.units')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.stockBefore')}</p>
                  <span className="text-sm font-medium">{activity.stockBefore} {t('operations.units')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.stockAfter')}</p>
                  <span className="text-sm font-medium">{activity.stockAfter} {t('operations.units')}</span>
                </div>
                {activity.notes && (
                  <div className="flex items-start justify-between pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">{t('operations.notes')}</p>
                    <span className="text-sm text-right flex-1 ml-4">{activity.notes}</span>
                  </div>
                )}
                {activity.reference && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{t('operations.reference')}</p>
                    <span className="text-sm font-medium">{activity.reference.id}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{t('operations.metadata')}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.createdBy')}</p>
                  <span className="text-sm font-medium">{adjustment.createdBy.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.createdAt')}</p>
                  <span className="text-sm font-medium">
                    {format(adjustment.createdAt, 'MMM d, yyyy, h:mm a')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.source')}</p>
                  <span className="text-sm font-medium">
                    {adjustment.source === 'MOBILE_SCANNING' ? t('operations.mobileApp') : t('operations.adminPanel')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
