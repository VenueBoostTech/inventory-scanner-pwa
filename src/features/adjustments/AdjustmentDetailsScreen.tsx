import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { useActivity } from '@/hooks/api/useActivities';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';

export function AdjustmentDetailsScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  const getReasonLabel = (reason: string) => {
    const reasonMap: Record<string, string> = {
      'received_shipment': t('operations.receivedShipment'),
      'return_customer': t('operations.returnCustomer'),
      'found_during_count': t('operations.foundDuringCount'),
      'damaged_items': t('operations.damagedItems'),
      'expired_items': t('operations.expiredItems'),
      'theft_loss': t('operations.theftLoss'),
      'inventory_correction': t('operations.inventoryCorrection'),
      'other': t('common.other'),
    };
    return reasonMap[reason] || reason;
  };

  const getSourceLabel = (source: string) => {
    if (source === 'mobile_scanning') return t('operations.mobileApp');
    if (source === 'pandacomet') return t('operations.adminPanel');
    if (source === 'webhook') return t('operations.orderSystem');
    return source;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.stockAdjustments')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t('operations.stockAdjustments')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('operations.adjustmentDetails')}</p>
        </div>

        {/* Product Info */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{t('operations.product')}</h3>
              <div className="flex items-start gap-3">
                {activity.product.imagePath ? (
                  <>
                    <img
                      src={activity.product.imagePath}
                      alt={activity.product.title}
                      className="h-16 w-16 rounded object-cover shrink-0"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="h-16 w-16 rounded bg-muted flex items-center justify-center shrink-0 hidden">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </>
                ) : (
                  <div className="h-16 w-16 rounded bg-muted flex items-center justify-center shrink-0">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium">{activity.product.title}</p>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">SKU:</span> {activity.product.sku}
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/products/${activity.product.id}`)}
                  className="w-full sm:w-auto h-8 text-xs"
                >
                  {t('products.viewProduct')}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
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
                {activity.reason && (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">{t('operations.reason')}</p>
                    <span className="text-sm font-medium">{getReasonLabel(activity.reason)}</span>
                  </div>
                )}
                {activity.warehouse && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{t('operations.warehouse')}</p>
                    <span className="text-sm font-medium">{activity.warehouse.name || activity.warehouse.code || '—'}</span>
                  </div>
                )}
                {activity.notes && (
                  <div className="flex items-start justify-between">
                    <p className="text-xs text-muted-foreground">{t('operations.notes')}</p>
                    <span className="text-sm text-right flex-1 ml-4">{activity.notes}</span>
                  </div>
                )}
                {activity.reference && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{t('operations.reference')}</p>
                    <span className="text-sm font-medium">{activity.reference.type || '—'}</span>
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
                <div className="flex items-start justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.initiatedBy')}</p>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {activity.staff ? activity.staff.name : t('operations.system')}
                    </div>
                    {activity.staff?.email && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {activity.staff.email}
                      </div>
                    )}
                    {!activity.staff && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t('operations.system')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.createdAt')}</p>
                  <span className="text-sm font-medium">
                    {activity.createdAt?.formattedDateTime || activity.createdAt?.date || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.source')}</p>
                  <span className="text-sm font-medium">
                    {getSourceLabel(activity.source)}
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
