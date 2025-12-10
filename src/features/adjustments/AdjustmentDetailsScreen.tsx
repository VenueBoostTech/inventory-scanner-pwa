import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { Package, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

// Mock data - in real app, fetch by ID from API
const mockAdjustments: Record<string, any> = {
  adj_001: {
    id: 'adj_001',
    code: 'ADJ-001',
    product: {
      id: 'prod_001',
      title: 'Coffee Beans',
      sku: 'COF-001',
      barcode: '8901234567890',
      category: 'Beverages',
    },
    adjustmentType: 'increase',
    quantity: 50,
    stockBefore: 100,
    stockAfter: 150,
    reason: 'Received shipment',
    notes: 'PO #12345 - Received from Supplier ABC',
    reference: 'PO-12345',
    warehouse: { id: 'wh_001', name: 'Main Warehouse' },
    source: 'MOBILE_SCANNING',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: { id: 'staff_001', name: 'John Doe' },
  },
  adj_002: {
    id: 'adj_002',
    code: 'ADJ-002',
    product: {
      id: 'prod_002',
      title: 'Tea Bags',
      sku: 'TEA-001',
      barcode: '8901234567891',
      category: 'Beverages',
    },
    adjustmentType: 'decrease',
    quantity: -5,
    stockBefore: 80,
    stockAfter: 75,
    reason: 'Damaged items',
    warehouse: { id: 'wh_001', name: 'Main Warehouse' },
    source: 'MOBILE_SCANNING',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdBy: { id: 'staff_002', name: 'Sarah M.' },
  },
  adj_003: {
    id: 'adj_003',
    code: 'ADJ-003',
    product: {
      id: 'prod_003',
      title: 'Sugar',
      sku: 'SUG-001',
      barcode: '8901234567892',
      category: 'Food',
    },
    adjustmentType: 'set',
    quantity: 200,
    stockBefore: 180,
    stockAfter: 200,
    reason: 'Inventory correction',
    warehouse: { id: 'wh_001', name: 'Main Warehouse' },
    source: 'PANDACOMET',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdBy: { id: 'staff_003', name: 'Mike T.' },
  },
};

export function AdjustmentDetailsScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const adjustment = id ? mockAdjustments[id] : null;

  if (!adjustment) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('operations.stockAdjustments')} showBack />
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
        </div>
      </div>
    );
  }

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

  const TypeIcon = getTypeIcon(adjustment.adjustmentType);

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={`${t('operations.stockAdjustments')} #${adjustment.code}`} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t('operations.stockAdjustments')} #{adjustment.code}
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
                  <p className="text-sm font-medium">{adjustment.product.title}</p>
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
                    <span className="text-sm font-medium">{getTypeLabel(adjustment.adjustmentType)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.quantity')}</p>
                  <span className={`text-sm font-semibold ${
                    adjustment.adjustmentType === 'set' 
                      ? 'text-blue-600' 
                      : adjustment.quantity > 0 
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {adjustment.adjustmentType === 'set' ? '=' : adjustment.quantity > 0 ? '+' : ''}
                    {adjustment.quantity} {t('operations.units')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.stockBefore')}</p>
                  <span className="text-sm font-medium">{adjustment.stockBefore} {t('operations.units')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.stockAfter')}</p>
                  <span className="text-sm font-medium">{adjustment.stockAfter} {t('operations.units')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{t('operations.reason')}</p>
                  <span className="text-sm font-medium">
                    {adjustment.reason === 'Received shipment' 
                      ? t('operations.receivedShipment') 
                      : adjustment.reason === 'Damaged items' 
                      ? t('operations.damagedItems')
                      : adjustment.reason === 'Expired items'
                      ? t('operations.expiredItems')
                      : adjustment.reason === 'Inventory correction'
                      ? t('operations.inventoryCorrection')
                      : adjustment.reason}
                  </span>
                </div>
                {adjustment.notes && (
                  <div className="flex items-start justify-between pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">{t('operations.notes')}</p>
                    <span className="text-sm text-right flex-1 ml-4">{adjustment.notes}</span>
                  </div>
                )}
                {adjustment.reference && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{t('operations.reference')}</p>
                    <span className="text-sm font-medium">{adjustment.reference}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">{t('operations.warehouse')}</p>
                  <span className="text-sm font-medium">{adjustment.warehouse.name}</span>
                </div>
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
