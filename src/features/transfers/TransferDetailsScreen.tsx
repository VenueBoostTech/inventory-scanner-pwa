import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import {
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Warehouse,
  ArrowDown,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data
const mockTransfers: Record<string, any> = {
  trf_007: {
    id: 'trf_007',
    code: 'TRF-007',
    status: 'pending',
    fromWarehouse: { id: 'wh_001', name: 'Main Warehouse' },
    toWarehouse: { id: 'wh_002', name: 'Secondary Warehouse' },
    itemCount: 2,
    totalQuantity: 35,
    items: [
      { productId: 'prod_001', productName: 'Coffee Beans', sku: 'COF-001', quantity: 20 },
      { productId: 'prod_002', productName: 'Tea Bags', sku: 'TEA-001', quantity: 15 },
    ],
    notes: 'Monthly stock rebalancing',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: { id: 'staff_001', name: 'John Doe' },
  },
  trf_006: {
    id: 'trf_006',
    code: 'TRF-006',
    status: 'in_transit',
    fromWarehouse: { id: 'wh_002', name: 'Secondary Warehouse' },
    toWarehouse: { id: 'wh_001', name: 'Main Warehouse' },
    itemCount: 3,
    totalQuantity: 50,
    items: [
      { productId: 'prod_003', productName: 'Sugar', sku: 'SUG-001', quantity: 30 },
      { productId: 'prod_004', productName: 'Milk', sku: 'MLK-001', quantity: 20 },
    ],
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
  },
  trf_005: {
    id: 'trf_005',
    code: 'TRF-005',
    status: 'completed',
    fromWarehouse: { id: 'wh_001', name: 'Main Warehouse' },
    toWarehouse: { id: 'wh_002', name: 'Secondary Warehouse' },
    itemCount: 10,
    totalQuantity: 200,
    items: [
      { productId: 'prod_001', productName: 'Coffee Beans', sku: 'COF-001', quantity: 100 },
      { productId: 'prod_002', productName: 'Tea Bags', sku: 'TEA-001', quantity: 100 },
    ],
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedBy: { id: 'staff_002', name: 'Sarah M.' },
  },
};

export function TransferDetailsScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const transfer = id ? mockTransfers[id] : null;

  if (!transfer) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('operations.stockTransfers')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      pending: {
        label: t('operations.pending'),
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: AlertCircle,
      },
      in_transit: {
        label: t('operations.inTransit'),
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: Truck,
      },
      completed: {
        label: t('operations.completed'),
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      },
      cancelled: {
        label: t('operations.cancelled'),
        className: 'bg-gray-50 text-gray-700 border-gray-200',
        icon: XCircle,
      },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    const Icon = statusInfo.icon;
    return (
      <Badge className={statusInfo.className}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {statusInfo.label}
      </Badge>
    );
  };

  const handleComplete = () => {
    setCompleteModalOpen(true);
  };

  const handleCompleteTransfer = () => {
    toast({
      title: t('transfers.transferCompleted'),
      description: t('transfers.transferCompletedDesc'),
    });
    setCompleteModalOpen(false);
    navigate('/operations/transfers');
  };

  const handleCancel = () => {
    toast({
      title: t('transfers.transferCancelled'),
      description: t('transfers.transferCancelledDesc'),
    });
    navigate('/operations/transfers');
  };

  const handleMarkInTransit = () => {
    toast({
      title: t('transfers.transferMarkedInTransit'),
      description: t('transfers.transferMarkedInTransitDesc'),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader
        title={`${t('transfers.transfer')} #${transfer.code}`}
        showBack
      />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t('transfers.transfer')} #{transfer.code}
          </h1>
          <p className="text-sm text-muted-foreground">{t('transfers.transferDetails')}</p>
        </div>

        {/* Warehouses */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 w-full">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{transfer.fromWarehouse.name}</span>
              </div>
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-2 w-full">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{transfer.toWarehouse.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status and Info */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('operations.status')}:</span>
                {getStatusBadge(transfer.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('operations.created')}:</span>
                <span className="text-sm font-medium">
                  {transfer.createdAt
                    ? format(new Date(transfer.createdAt), 'MMM d, yyyy, h:mm a')
                    : '—'}
                </span>
              </div>
              {transfer.createdBy && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('operations.by')}:</span>
                  <span className="text-sm font-medium">{transfer.createdBy.name}</span>
                </div>
              )}
              {transfer.startedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('operations.started')}:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(transfer.startedAt), 'MMM d, yyyy, h:mm a')}
                  </span>
                </div>
              )}
              {transfer.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('operations.completed')}:</span>
                  <span className="text-sm font-medium">
                    {format(new Date(transfer.completedAt), 'MMM d, yyyy, h:mm a')}
                  </span>
                </div>
              )}
              {transfer.completedBy && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('transfers.completedBy')}:</span>
                  <span className="text-sm font-medium">{transfer.completedBy.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">
                {t('operations.items')} ({transfer.itemCount} {t('operations.products')}, {transfer.totalQuantity} {t('operations.units')})
              </h3>
              <div className="space-y-2">
                {transfer.items?.map((item: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 pb-2 border-b border-border last:border-b-0 last:pb-0">
                    <Package className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {t('operations.quantity')}: {item.quantity} {t('operations.units')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {transfer.notes && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">{t('operations.notes')}</h3>
                <p className="text-sm text-muted-foreground">{transfer.notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {transfer.status === 'pending' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkInTransit}
                className="flex-1 py-2.5"
              >
                {t('transfers.markInTransit')}
              </Button>
              <Button
                size="sm"
                onClick={handleComplete}
                className="flex-1 py-2.5 border-none bg-[#164945] text-white hover:bg-[#123b37]"
              >
                {t('transfers.completeTransfer')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="flex-1 py-2.5 text-red-600 border-red-200 hover:bg-red-50"
              >
                {t('transfers.cancelTransfer')}
              </Button>
            </>
          )}
          {transfer.status === 'in_transit' && (
            <Button
              size="sm"
              onClick={handleComplete}
              className="w-full py-2.5 border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {t('transfers.completeTransfer')}
            </Button>
          )}
        </div>
      </div>

      {/* Complete Transfer Modal */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>{t('transfers.completeTransfer')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('transfers.confirmItemsReceived')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Items List */}
            {transfer.items && transfer.items.length > 0 && (
              <div className="space-y-2">
                {transfer.items.map((item: any, index: number) => (
                  <Card key={index} className="border border-border bg-muted/50 shadow-none">
                    <CardContent className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {t('operations.units')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* All Items Received */}
            <div className="space-y-2">
                <label className="text-sm font-medium">{t('transfers.allItemsReceived')}</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input type="radio" name="received" value="yes" defaultChecked className="h-4 w-4" />
                    <span className="text-sm">{t('transfers.yesAllItemsReceived')}</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input type="radio" name="received" value="no" className="h-4 w-4" />
                    <span className="text-sm">{t('transfers.noDiscrepancies')}</span>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('operations.notes')} ({t('operations.optional')})
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t('transfers.completeTransferNotesPlaceholder')}
                />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompleteModalOpen(false)}
              className="w-full sm:w-auto py-2.5"
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              onClick={handleCompleteTransfer}
              className="w-full sm:w-auto py-2.5 border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {t('operations.complete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
