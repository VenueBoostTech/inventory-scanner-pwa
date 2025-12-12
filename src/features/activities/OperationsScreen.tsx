import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';
import { useOperationsOverview } from '@/hooks/api/useActivities';
import {
  Package,
  Truck,
  ClipboardList,
  Warehouse,
  Activity,
  ArrowRight,
} from 'lucide-react';

const operationCards = [
  {
    id: 'activities',
    subtitleKey: 'activitiesSubtitle',
    icon: Activity,
    route: '/operations/activities',
  },
  {
    id: 'transfers',
    subtitleKey: 'transfersSubtitle',
    icon: Truck,
    route: '/operations/transfers',
  },
  {
    id: 'adjustments',
    subtitleKey: 'adjustmentsSubtitle',
    icon: Package,
    route: '/operations/adjustments',
  },
  {
    id: 'counts',
    subtitleKey: 'countsSubtitle',
    icon: ClipboardList,
    route: '/operations/counts',
  },
  {
    id: 'warehouses',
    subtitleKey: 'warehousesSubtitle',
    icon: Warehouse,
    route: '/operations/warehouses',
  },
];

export function OperationsScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: overview, isLoading } = useOperationsOverview();

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.title')} />
      <div className="space-y-4 px-4 py-4">
        {/* Summary Cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('operations.overview')}
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Transfers Card */}
              <Card className="border border-border bg-white shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-[#164945]" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                      {t('operations.transfers')}
                    </h3>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('operations.pending')}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {overview?.summary.transfers.pending || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('operations.inTransit')}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {overview?.summary.transfers.inTransit || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('operations.today')}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {overview?.summary.transfers.today || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-[10px] font-medium text-muted-foreground">{t('operations.total')}</span>
                      <span className="text-base font-bold text-[#164945]">
                        {overview?.summary.transfers.total || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock Counts Card */}
              <Card className="border border-border bg-white shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="h-4 w-4 text-[#164945]" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                      {t('operations.stockCounts')}
                    </h3>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('operations.active')}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {overview?.summary.stockCounts.active || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('operations.today')}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {overview?.summary.stockCounts.today || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-[10px] font-medium text-muted-foreground">{t('operations.total')}</span>
                      <span className="text-base font-bold text-[#164945]">
                        {overview?.summary.stockCounts.total || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Adjustments Card */}
              <Card className="border border-border bg-white shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-[#164945]" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                      {t('operations.adjustments')}
                    </h3>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('operations.today')}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {overview?.summary.adjustments.today || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('operations.thisWeek')}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {overview?.summary.adjustments.thisWeek || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-[10px] font-medium text-muted-foreground">{t('operations.total')}</span>
                      <span className="text-base font-bold text-[#164945]">
                        {overview?.summary.adjustments.total || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activities Card */}
              <Card className="border border-border bg-white shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-[#164945]" />
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                      {t('operations.activities')}
                    </h3>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('operations.today')}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {overview?.summary.activities.today || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{t('operations.thisWeek')}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {overview?.summary.activities.thisWeek || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-[10px] font-medium text-muted-foreground">{t('operations.total')}</span>
                      <span className="text-base font-bold text-[#164945]">
                        {overview?.summary.activities.total || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Operation Cards */}
        <div className="space-y-3">
          {operationCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.id}
                className="border border-border bg-white shadow-none cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(card.route)}
              >
                <CardContent className="px-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#164945]/10">
                      <Icon className="h-6 w-6 text-[#164945]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-foreground">{t(`operations.${card.id}`)}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{t(`operations.${card.subtitleKey}`)}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
