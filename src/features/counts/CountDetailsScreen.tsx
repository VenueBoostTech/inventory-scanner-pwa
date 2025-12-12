import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useStockCount, useCompleteStockCount } from '@/hooks/api/useStockCounts';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';

export function CountDetailsScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: count, isLoading } = useStockCount(id || '');
  const { mutateAsync: completeStockCount, isPending: isCompleting } = useCompleteStockCount();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('operations.stockCounts')} showBack />
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!count) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('operations.stockCounts')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      in_progress: {
        label: t('operations.inProgress'),
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: null,
      },
      completed: {
        label: t('operations.completed'),
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      },
      cancelled: {
        label: t('operations.cancelled'),
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: null,
      },
    };
    const statusInfo = statusMap[status] || statusMap.in_progress;
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.icon && <statusInfo.icon className="h-3 w-3 mr-1" />}
        {statusInfo.label}
      </Badge>
    );
  };

  const handleContinue = () => {
    if (id) {
      navigate(`/operations/counts/${id}/counting`);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    
    try {
      await completeStockCount({
        countId: id,
        autoAdjust: false,
        notes: '',
      });
      toast({
        title: t('operations.completeCount'),
        description: t('operations.countCompletedDesc'),
      });
      navigate(`/operations/counts/${id}/report`);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('operations.countCompletedDesc'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={`${t('operations.stockCounts')} #${count.code}`} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t('operations.stockCounts')} #{count.code}
          </h1>
          <p className="text-sm text-muted-foreground">{t('operations.countDetails')}</p>
        </div>

        {/* Status and Info */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t('operations.status')}</p>
                <div className="mt-1">{getStatusBadge(count.status)}</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('operations.warehouse')}</p>
                <p className="text-sm font-medium mt-1">{count.warehouse.name}</p>
              </div>
              {count.startedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.started')}</p>
                  <p className="text-sm mt-1">
                    {format(new Date(count.startedAt), 'MMM d, yyyy, h:mm a')}
                  </p>
                </div>
              )}
              {count.performedBy && (
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.startedBy')}</p>
                  <p className="text-sm mt-1">{count.performedBy.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progress */}
        {count.status === 'in_progress' && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t('operations.progress')}: {count.itemsCounted}/{count.totalItems} {t('operations.items')} ({count.progress}%)
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-[#164945] h-2 rounded-full"
                    style={{ width: `${count.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border border-border bg-muted/30 shadow-none">
            <CardContent className="px-3 py-3 text-center">
              <div className="text-lg font-bold text-foreground">{count.totalItemsCounted || 0}</div>
              <div className="text-xs text-muted-foreground">{t('operations.counted')}</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-muted/30 shadow-none">
            <CardContent className="px-3 py-3 text-center">
              <div className="text-lg font-bold text-foreground">{count.itemsWithVariance || 0}</div>
              <div className="text-xs text-muted-foreground">{t('operations.discrepancies')}</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-muted/30 shadow-none">
            <CardContent className="px-3 py-3 text-center">
              <div className="text-lg font-bold text-emerald-600">
                +{count.totalVariance && count.totalVariance > 0 ? count.totalVariance : 0}
              </div>
              <div className="text-xs text-muted-foreground">{t('operations.surplus')}</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-muted/30 shadow-none">
            <CardContent className="px-3 py-3 text-center">
              <div className="text-lg font-bold text-red-600">
                {count.totalVariance && count.totalVariance < 0 ? Math.abs(count.totalVariance) : 0}
              </div>
              <div className="text-xs text-muted-foreground">{t('operations.shortage')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Counted Items Table */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="p-0">
            <div className="px-3 py-3 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{t('operations.countedItems')}</h3>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">{t('common.filter')}</Button>
            </div>
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">{t('operations.product')}</TableHead>
                    <TableHead className="min-w-[100px]">SKU</TableHead>
                    <TableHead className="min-w-[80px]">{t('operations.system')}</TableHead>
                    <TableHead className="min-w-[80px]">{t('operations.counted')}</TableHead>
                    <TableHead className="min-w-[80px]">{t('operations.diff')}</TableHead>
                    <TableHead className="min-w-[80px]">{t('operations.status')}</TableHead>
                    <TableHead className="min-w-[60px]">{t('operations.notes')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {count.items && count.items.length > 0 ? (
                    count.items.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.productSku}</TableCell>
                        <TableCell>{item.expectedQuantity}</TableCell>
                        <TableCell>{item.countedQuantity}</TableCell>
                        <TableCell
                          className={
                            item.variance > 0
                              ? 'text-emerald-600'
                              : item.variance < 0
                              ? 'text-red-600'
                              : ''
                          }
                        >
                          {item.variance > 0 ? '+' : ''}
                          {item.variance}
                        </TableCell>
                        <TableCell>
                          {item.variance === 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          {item.notes && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                        {t('operations.noItemsCounted')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pending Items */}
        {count.status === 'in_progress' && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <h3 className="text-sm font-semibold mb-1">
                {t('operations.pendingItems')} ({count.totalItems - count.itemsCounted})
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('operations.pendingItemsDesc')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {count.status === 'in_progress' && (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 w-full sm:w-auto"
              onClick={handleContinue}
            >
              {t('operations.continueCounting')}
            </Button>
            <Button
              className="flex-1 w-full sm:w-auto border-none bg-[#164945] text-white hover:bg-[#123b37]"
              onClick={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting ? t('common.loading') : t('operations.completeCount')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
