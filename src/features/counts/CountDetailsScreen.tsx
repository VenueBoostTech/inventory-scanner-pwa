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
import {
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data - in real app, fetch by ID from API
const mockCounts: Record<string, any> = {
  cnt_001: {
    id: 'cnt_001',
    code: 'CNT-001',
    status: 'in_progress',
    warehouse: { id: 'wh_001', name: 'Main Warehouse' },
    totalItems: 150,
    itemsCounted: 45,
    progress: 30,
    discrepancies: 3,
    totalSurplus: 25,
    totalShortage: -12,
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    createdBy: { id: 'staff_001', name: 'John D.' },
  },
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
    notes: '',
  },
  {
    productId: 'prod_002',
    productName: 'Tea Bags',
    sku: 'TEA-001',
    systemQuantity: 80,
    countedQuantity: 80,
    discrepancy: 0,
    status: 'match',
  },
  {
    productId: 'prod_003',
    productName: 'Sugar',
    sku: 'SUG-001',
    systemQuantity: 100,
    countedQuantity: 105,
    discrepancy: 5,
    status: 'discrepancy',
    notes: '',
  },
  {
    productId: 'prod_004',
    productName: 'Milk',
    sku: 'MLK-001',
    systemQuantity: 50,
    countedQuantity: 50,
    discrepancy: 0,
    status: 'match',
  },
];

export function CountDetailsScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const count = id ? mockCounts[id] : null;

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
    toast({
      title: t('operations.continueCounting'),
      description: t('common.loading'),
    });
    // TODO: Navigate to counting screen
  };

  const handleComplete = () => {
    toast({
      title: t('operations.completeCount'),
      description: t('common.loading'),
    });
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
              <div>
                <p className="text-xs text-muted-foreground">{t('operations.started')}</p>
                <p className="text-sm mt-1">
                  {format(count.startedAt, 'MMM d, yyyy, h:mm a')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('operations.startedBy')}</p>
                <p className="text-sm mt-1">{count.createdBy?.name || '—'}</p>
              </div>
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
              <div className="text-lg font-bold text-foreground">{count.itemsCounted}</div>
              <div className="text-xs text-muted-foreground">{t('operations.counted')}</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-muted/30 shadow-none">
            <CardContent className="px-3 py-3 text-center">
              <div className="text-lg font-bold text-foreground">{count.discrepancies || 0}</div>
              <div className="text-xs text-muted-foreground">{t('operations.discrepancies')}</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-muted/30 shadow-none">
            <CardContent className="px-3 py-3 text-center">
              <div className="text-lg font-bold text-emerald-600">
                +{count.totalSurplus || 0}
              </div>
              <div className="text-xs text-muted-foreground">{t('operations.surplus')}</div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-muted/30 shadow-none">
            <CardContent className="px-3 py-3 text-center">
              <div className="text-lg font-bold text-red-600">
                {count.totalShortage || 0}
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
                  {mockCountItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.sku}</TableCell>
                      <TableCell>{item.systemQuantity}</TableCell>
                      <TableCell>{item.countedQuantity}</TableCell>
                      <TableCell
                        className={
                          item.discrepancy > 0
                            ? 'text-emerald-600'
                            : item.discrepancy < 0
                            ? 'text-red-600'
                            : ''
                        }
                      >
                        {item.discrepancy > 0 ? '+' : ''}
                        {item.discrepancy}
                      </TableCell>
                      <TableCell>
                        {item.status === 'match' ? (
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
                  ))}
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
            >
              {t('operations.completeCount')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
