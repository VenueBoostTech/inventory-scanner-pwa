import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useStockAdjustment } from '@/hooks/api/useStockAdjustment';
import { useProductWarehouses } from '@/hooks/api/useProductWarehouses';
import { authStore } from '@/stores/authStore';
import { TrendingUp, TrendingDown, Minus, Loader2, AlertCircle, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AdjustStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}

type AdjustmentType = 'increase' | 'decrease' | 'set';

export function AdjustStockModal({ open, onOpenChange, product }: AdjustStockModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { mutateAsync: adjustStock, isPending } = useStockAdjustment();
  const profile = authStore((state) => state.profile);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('increase');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [enableWarehouse, setEnableWarehouse] = useState(true);
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);

  const commonReasons = [
    { value: 'received_shipment', label: t('operations.receivedShipment') },
    { value: 'return_customer', label: t('operations.returnCustomer') },
    { value: 'found_during_count', label: t('operations.foundDuringCount') },
    { value: 'damaged_items', label: t('operations.damagedItems') },
    { value: 'expired_items', label: t('operations.expiredItems') },
    { value: 'theft_loss', label: t('operations.theftLoss') },
    { value: 'inventory_correction', label: t('operations.inventoryCorrection') },
    { value: 'other', label: t('common.other') },
  ];
  
  // Fetch warehouses where product has stock when warehouse tracking is enabled
  const { data: productWarehousesData, isLoading: loadingWarehouses } = useProductWarehouses(
    enableWarehouse && product?.id ? product.id : null
  );
  const availableWarehouses = productWarehousesData?.warehouses || [];

  // Auto-pre-select warehouses when they're loaded
  useEffect(() => {
    if (enableWarehouse && availableWarehouses.length > 0 && selectedWarehouses.length === 0) {
      // Pre-select all warehouses where product has stock (≥1 unit)
      const warehouseIds = availableWarehouses
        .filter(wh => wh.currentStock >= 1)
        .map(wh => wh.id);
      setSelectedWarehouses(warehouseIds);
    }
  }, [enableWarehouse, availableWarehouses, selectedWarehouses.length]);

  const preview = useMemo(() => {
    if (!quantity) return null;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return null;

    const current = product.stockQuantity || 0;
    let newStock = current;

    if (adjustmentType === 'increase') {
      newStock = current + qty;
      return { before: current, after: newStock, change: `+${qty}` };
    } else if (adjustmentType === 'decrease') {
      newStock = Math.max(0, current - qty);
      return { before: current, after: newStock, change: `-${qty}` };
    } else {
      newStock = qty;
      return { before: current, after: newStock, change: `=${qty}` };
    }
  }, [quantity, adjustmentType, product.stockQuantity]);

  const handleSave = async () => {
    if (!quantity) {
      toast({
        title: t('common.error'),
        description: t('products.enterQuantity'),
        variant: 'destructive',
      });
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: t('common.error'),
        description: t('products.quantityMustBeGreaterThanZero'),
        variant: 'destructive',
      });
      return;
    }

    if (adjustmentType === 'decrease' && qty > product.stockQuantity) {
      toast({
        title: t('common.error'),
        description: t('products.cannotDecreaseBelowZero'),
        variant: 'destructive',
      });
      return;
    }

    if (!reason) {
      toast({
        title: t('common.error'),
        description: t('products.selectReason'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload: any = {
        productId: product.id,
        adjustmentType,
        quantity: qty,
        reason,
        notes: notes || undefined,
      };

      // If warehouse tracking is enabled, use warehouseIds array
      if (enableWarehouse && selectedWarehouses.length > 0) {
        payload.warehouseIds = selectedWarehouses;
      } else if (!enableWarehouse) {
        // If disabled, don't send warehouse info (updates total stock only)
      }

      await adjustStock(payload);

      toast({
        title: t('products.stockAdjusted'),
        description: t('products.stockAdjustedDesc'),
      });

      // Reset form
      setQuantity('');
      setReason('');
      setNotes('');
      setEnableWarehouse(true);
      setSelectedWarehouses([]);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('products.adjustmentError'),
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setQuantity('');
    setReason('');
    setNotes('');
    setEnableWarehouse(true);
    setSelectedWarehouses([]);
    setAdjustmentType('increase');
    onOpenChange(false);
  };

  const toggleWarehouse = (warehouseId: string) => {
    setSelectedWarehouses(prev =>
      prev.includes(warehouseId)
        ? prev.filter(id => id !== warehouseId)
        : [...prev, warehouseId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>{t('operations.newAdjustment')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Product Info */}
          {product && (
            <Card className="border border-border bg-muted/50 shadow-none">
              <CardContent className="px-3 py-3">
                <div className="flex items-start gap-3">
                  {product.imagePath ? (
                    <>
                      <img
                        src={product.imagePath}
                        alt={product.title}
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
                    <p className="text-sm font-medium">{product.title}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">SKU:</span> {product.sku}
                      </div>
                      <div>
                        <span className="font-medium">{t('operations.currentStock')}:</span> {product.stockQuantity || 0} {t('operations.units')}
                      </div>
                      <div>
                        <span className="font-medium">{t('operations.lowThreshold')}:</span> {product.lowQuantity || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Adjustment Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('products.adjustmentType')}</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('increase')}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                  adjustmentType === 'increase'
                    ? 'border-[#164945] bg-[#164945]/10'
                    : 'border-border hover:border-[#164945]/50'
                }`}
              >
                <TrendingUp className={`h-5 w-5 ${adjustmentType === 'increase' ? 'text-[#164945]' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${adjustmentType === 'increase' ? 'text-[#164945]' : 'text-muted-foreground'}`}>
                  {t('operations.increase')}
                </span>
                <span className="text-[10px] text-muted-foreground">{t('operations.addStock')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('decrease')}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                  adjustmentType === 'decrease'
                    ? 'border-[#164945] bg-[#164945]/10'
                    : 'border-border hover:border-[#164945]/50'
                }`}
              >
                <TrendingDown className={`h-5 w-5 ${adjustmentType === 'decrease' ? 'text-[#164945]' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${adjustmentType === 'decrease' ? 'text-[#164945]' : 'text-muted-foreground'}`}>
                  {t('operations.decrease')}
                </span>
                <span className="text-[10px] text-muted-foreground">{t('operations.removeStock')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('set')}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                  adjustmentType === 'set'
                    ? 'border-[#164945] bg-[#164945]/10'
                    : 'border-border hover:border-[#164945]/50'
                }`}
              >
                <Minus className={`h-5 w-5 ${adjustmentType === 'set' ? 'text-[#164945]' : 'text-muted-foreground'}`} />
                <span className={`text-xs font-medium ${adjustmentType === 'set' ? 'text-[#164945]' : 'text-muted-foreground'}`}>
                  {t('operations.set')}
                </span>
                <span className="text-[10px] text-muted-foreground">{t('operations.setToValue')}</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('products.quantity')} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Preview */}
          {preview && (
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('operations.preview')}: {preview.before} → {preview.after} {t('operations.units')} ({preview.change})
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('operations.reason')} <span className="text-red-500">*</span>
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder={t('operations.selectReason')} />
              </SelectTrigger>
              <SelectContent>
                {commonReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('products.notes')} ({t('products.optional')})
            </label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('products.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Warehouse Tracking Toggle */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableWarehouse}
                onChange={(e) => {
                  setEnableWarehouse(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedWarehouses([]);
                  }
                }}
                className="h-4 w-4 rounded border-gray-300 text-[#164945] focus:ring-[#164945]"
              />
              <span className="text-sm font-medium">
                {t('products.trackByWarehouse')}
              </span>
            </label>
            <p className="text-xs text-muted-foreground">
              {t('products.trackByWarehouseDesc')}
            </p>
          </div>

          {/* Warehouse Multi-Select */}
          {enableWarehouse && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('products.warehouses')} ({t('products.optional')})
              </label>
              {loadingWarehouses ? (
                <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/50">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t('products.loadingWarehouses')}
                  </span>
                </div>
              ) : availableWarehouses.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-md border border-border bg-white p-3">
                  {availableWarehouses.map((wh) => {
                    const isSelected = selectedWarehouses.includes(wh.id);
                    const hasStock = wh.currentStock >= 1;
                    return (
                      <label
                        key={wh.id}
                        className={`flex items-start gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-[#164945] bg-[#164945]/10'
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleWarehouse(wh.id)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#164945] focus:ring-[#164945]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{wh.name}</span>
                            {wh.code && (
                              <span className="text-xs text-muted-foreground">
                                ({wh.code})
                              </span>
                            )}
                            {hasStock && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                {wh.currentStock} {t('products.units')}
                              </span>
                            )}
                          </div>
                          {!hasStock && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t('products.noStock')}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-md border border-amber-200 bg-amber-50/50">
                  <p className="text-sm text-amber-900">
                    {t('products.noWarehousesWithStock')}
                  </p>
                  <p className="text-xs text-amber-800 mt-1">
                    {t('products.adjustmentWillUpdateTotalOnly')}
                  </p>
                </div>
              )}
              {selectedWarehouses.length === 0 && enableWarehouse && (
                <div className="flex items-start gap-2 p-2 rounded-md border border-amber-200 bg-amber-50/50">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    {t('products.noWarehousesSelected')}
                  </p>
                </div>
              )}
              {selectedWarehouses.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('products.adjustmentWillBeDistributed')}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="w-full sm:w-auto border-none bg-[#164945] text-white hover:bg-[#123b37]"
          >
            {isPending ? t('common.loading') : t('products.saveAdjustment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
