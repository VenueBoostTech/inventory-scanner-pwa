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
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('operations.overview')}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : (
              <>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-foreground">
                        {overview?.summary.transfers.pending || 0}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
                        {t('operations.pendingTransfers')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-foreground">
                        {overview?.summary.stockCounts.active || 0}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
                        {t('operations.activeCounts')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-foreground">
                        {overview?.summary.adjustments.today || 0}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
                        {t('operations.todaysAdjustments')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
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
