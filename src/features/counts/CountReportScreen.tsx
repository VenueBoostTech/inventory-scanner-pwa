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
import { format } from 'date-fns';

// Mock data - in real app, fetch by ID from API
const mockCounts: Record<string, any> = {
  cnt_002: {
    id: 'cnt_002',
    code: 'CNT-002',
    status: 'completed',
    warehouse: { id: 'wh_002', name: 'Secondary Warehouse' },
    totalItems: 80,
    itemsCounted: 80,
    discrepancies: 5,
    totalSurplus: 15,
    totalShortage: -8,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedBy: { id: 'staff_002', name: 'Sarah M.' },
  },
};

const mockCountItems = [
  {
    productId: 'prod_001',
    productName: 'Coffee Beans',
    sku: 'COF-001',
    systemQuantity: 150,
    countedQuantity: 148,
    discrepancy: -2,
    status: 'discrepancy',
  },
  {
    productId: 'prod_003',
    productName: 'Sugar',
    sku: 'SUG-001',
    systemQuantity: 100,
    countedQuantity: 105,
    discrepancy: 5,
    status: 'discrepancy',
  },
  {
    productId: 'prod_005',
    productName: 'Honey',
    sku: 'HON-001',
    systemQuantity: 25,
    countedQuantity: 20,
    discrepancy: -5,
    status: 'discrepancy',
  },
];

export function CountReportScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const count = id ? mockCounts[id] : null;

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
    toast({
      title: t('operations.applyAdjustments'),
      description: t('common.loading'),
    });
    // TODO: Apply adjustments
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={`${t('operations.discrepancyReport')} - ${count.code}`} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t('operations.discrepancyReport')} - {count.code}
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
              <div>
                <p className="text-xs text-muted-foreground">{t('operations.completed')}</p>
                <p className="text-sm mt-1">
                  {count.completedAt
                    ? format(count.completedAt, 'MMM d, yyyy')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('operations.by')}</p>
                <p className="text-sm mt-1">{count.completedBy?.name || '—'}</p>
              </div>
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
                  <p className="text-sm font-semibold mt-1">{count.totalItems}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.matched')}</p>
                  <p className="text-sm font-semibold mt-1">
                    {count.totalItems - (count.discrepancies || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.discrepancies')}</p>
                  <p className="text-sm font-semibold mt-1">{count.discrepancies || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.net')}</p>
                  <p className="text-sm font-semibold mt-1">
                    {((count.totalSurplus || 0) + (count.totalShortage || 0)) > 0
                      ? '+'
                      : ''}
                    {(count.totalSurplus || 0) + (count.totalShortage || 0)}{' '}
                    {t('operations.units')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.totalSurplus')}</p>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    +{count.totalSurplus || 0} {t('operations.units')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('operations.totalShortage')}</p>
                  <p className="text-sm font-semibold text-red-600 mt-1">
                    {count.totalShortage || 0} {t('operations.units')}
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
                  {mockCountItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.sku}</TableCell>
                      <TableCell>{item.systemQuantity}</TableCell>
                      <TableCell>{item.countedQuantity}</TableCell>
                      <TableCell
                        className={
                          item.discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'
                        }
                      >
                        {item.discrepancy > 0 ? '+' : ''}
                        {item.discrepancy}
                      </TableCell>
                      <TableCell
                        className={
                          item.discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'
                        }
                      >
                        {item.discrepancy > 0 ? '+' : ''}
                        €{Math.abs(item.discrepancy * 15.99).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
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
