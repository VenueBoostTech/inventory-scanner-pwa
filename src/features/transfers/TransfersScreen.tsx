import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Truck, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

// Mock data
const mockTransfers = [
  {
    id: 'trf_001',
    code: 'TRF-001',
    status: 'pending',
    fromWarehouse: { id: 'wh_001', name: 'Main Warehouse' },
    toWarehouse: { id: 'wh_002', name: 'Secondary' },
    itemCount: 2,
    totalQuantity: 5,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'trf_002',
    code: 'TRF-002',
    status: 'in_transit',
    fromWarehouse: { id: 'wh_002', name: 'Secondary' },
    toWarehouse: { id: 'wh_001', name: 'Main Warehouse' },
    itemCount: 1,
    totalQuantity: 10,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'trf_003',
    code: 'TRF-003',
    status: 'completed',
    fromWarehouse: { id: 'wh_001', name: 'Main' },
    toWarehouse: { id: 'wh_002', name: 'Secondary' },
    itemCount: 1,
    totalQuantity: 3,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

export function TransfersScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      pending: {
        label: t('operations.pending'),
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        icon: null,
      },
      in_transit: {
        label: t('operations.inTransit'),
        className: 'bg-purple-50 text-purple-700 border-purple-200',
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
        icon: XCircle,
      },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.icon && <statusInfo.icon className="h-3 w-3 mr-1" />}
        {statusInfo.label}
      </Badge>
    );
  };

  const handleCreate = () => {
    toast({
      title: t('operations.newTransfer'),
      description: t('common.loading'),
    });
    // TODO: Navigate to create transfer screen
  };

  const handleComplete = (id: string) => {
    toast({
      title: t('operations.completed'),
      description: t('operations.transfers'),
    });
  };

  const handleCancel = (id: string) => {
    toast({
      title: t('operations.cancelled'),
      description: t('operations.transfers'),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.stockTransfers')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between">
          <div></div>
          <Button
            size="sm"
            className="gap-2 border-none bg-[#164945] text-white hover:bg-[#123b37]"
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4" />
            {t('operations.new')}
          </Button>
        </div>

        {/* Transfers List */}
        <div className="space-y-3">
          {mockTransfers.map((transfer) => (
            <Card key={transfer.id} className="border border-border bg-white shadow-none">
              <CardContent className="px-3 py-3">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {transfer.code}
                          </p>
                          {getStatusBadge(transfer.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {transfer.fromWarehouse.name} → {transfer.toWarehouse.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transfer.itemCount} {t('operations.items')} • {t('operations.created')}: {format(transfer.createdAt, 'MMM d, yyyy')}
                        </p>
                        {transfer.status === 'completed' && transfer.completedAt && (
                          <p className="text-xs text-muted-foreground">
                            {t('operations.completed')}: {format(transfer.completedAt, 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {transfer.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        {t('operations.viewDetails')}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 border-none bg-[#164945] text-white hover:bg-[#123b37]"
                        onClick={() => handleComplete(transfer.id)}
                      >
                        {t('operations.complete')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleCancel(transfer.id)}
                      >
                        {t('operations.cancel')}
                      </Button>
                    </div>
                  )}
                  {transfer.status === 'in_transit' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        {t('operations.viewDetails')}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 border-none bg-[#164945] text-white hover:bg-[#123b37]"
                        onClick={() => handleComplete(transfer.id)}
                      >
                        {t('operations.complete')}
                      </Button>
                    </div>
                  )}
                  {transfer.status === 'completed' && (
                    <Button variant="outline" size="sm" className="w-full">
                      {t('operations.viewDetails')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
