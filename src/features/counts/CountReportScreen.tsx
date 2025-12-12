import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
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
import { useStockCount } from '@/hooks/api/useStockCounts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export function CountReportScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const { data: count, isLoading } = useStockCount(id || '');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('operations.discrepancyReport')} showBack />
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!count || count.status !== 'completed') {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('operations.discrepancyReport')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  const handleApplyAdjustments = () => {
    // Adjustments are already applied when count is completed with autoAdjust=true
    toast({
      title: t('operations.adjustmentsApplied'),
      description: t('operations.adjustmentsAppliedDesc'),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={`${t('operations.discrepancyReport')} - ${count.referenceNumber}`} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t('operations.discrepancyReport')} - {count.referenceNumber}
          </h1>
          <p className="text-sm text-muted-foreground">{t('operations.reportDescription')}</p>
        </div>

        {/* Report Info */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{t('operations.warehouse')}</p>
                <p className="text-sm font-medium mt-1">{count.warehouse.name}</p>
              </div>
              {count.completedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.completed')}</p>
                  <p className="text-sm mt-1">
                    {format(new Date(count.completedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
              {count.performedBy && (
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.by')}</p>
                  <p className="text-sm mt-1">{count.performedBy.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">{t('operations.summary')}</h3>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.totalItems')}</p>
                  <p className="text-sm font-semibold mt-1">{count.totalItemsCounted || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.matched')}</p>
                  <p className="text-sm font-semibold mt-1">
                    {(count.totalItemsCounted || 0) - (count.itemsWithVariance || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.discrepancies')}</p>
                  <p className="text-sm font-semibold mt-1">{count.itemsWithVariance || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.net')}</p>
                  <p className="text-sm font-semibold mt-1">
                    {count.totalVariance && count.totalVariance > 0 ? '+' : ''}
                    {count.totalVariance || 0} {t('operations.units')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.totalSurplus')}</p>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    +{count.totalVariance && count.totalVariance > 0 ? count.totalVariance : 0} {t('operations.units')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.totalShortage')}</p>
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    {count.totalVariance && count.totalVariance < 0 ? Math.abs(count.totalVariance) : 0} {t('operations.units')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discrepancy Items Table */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="p-0">
            <div className="px-3 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">{t('operations.discrepancyItemsOnly')}</h3>
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
                    <TableHead className="min-w-[120px]">{t('operations.valueImpact')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {count.items && count.items.filter(item => item.variance !== 0).length > 0 ? (
                    count.items
                      .filter(item => item.variance !== 0)
                      .map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.productSku}</TableCell>
                          <TableCell>{item.expectedQuantity}</TableCell>
                          <TableCell>{item.countedQuantity}</TableCell>
                          <TableCell
                            className={
                              item.variance > 0 ? 'text-emerald-600' : 'text-red-600'
                            }
                          >
                            {item.variance > 0 ? '+' : ''}
                            {item.variance}
                          </TableCell>
                          <TableCell
                            className={
                              item.variance > 0 ? 'text-emerald-600' : 'text-red-600'
                            }
                          >
                            {item.variance > 0 ? '+' : ''}
                            €{Math.abs(item.variance * 15.99).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                        {t('operations.noDiscrepancies')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
          onClick={handleApplyAdjustments}
        >
          {t('operations.applyAdjustments')}
        </Button>
      </div>
    </div>
  );
}
