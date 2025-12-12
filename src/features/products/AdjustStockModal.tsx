import { useState, useMemo } from 'react';
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
import { authStore } from '@/stores/authStore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AdjustStockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}

type AdjustmentType = 'increase' | 'decrease' | 'set';

const commonReasons = [
  { value: 'received_shipment', label: 'Received shipment' },
  { value: 'return_from_customer', label: 'Return from customer' },
  { value: 'found_during_count', label: 'Found during count' },
  { value: 'damaged_items', label: 'Damaged items' },
  { value: 'expired_items', label: 'Expired items' },
  { value: 'theft_loss', label: 'Theft/Loss' },
  { value: 'inventory_correction', label: 'Inventory correction' },
  { value: 'sample_giveaway', label: 'Sample/Giveaway' },
  { value: 'other', label: 'Other' },
];

const mockWarehouses = [
  { id: 'wh_001', name: 'Main Warehouse' },
  { id: 'wh_002', name: 'Secondary Warehouse' },
];

export function AdjustStockModal({ open, onOpenChange, product }: AdjustStockModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const { mutateAsync: adjustStock, isPending } = useStockAdjustment();
  const profile = authStore((state) => state.profile);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('increase');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [warehouseId, setWarehouseId] = useState(profile?.permissions?.warehouseIds?.[0] || '');

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
      await adjustStock({
        productId: product.id,
        adjustmentType,
        quantity: qty,
        reason,
        notes: notes || undefined,
        warehouseId: warehouseId || undefined,
      });

      toast({
        title: t('products.stockAdjusted'),
        description: t('products.stockAdjustedDesc'),
      });

      // Reset form
      setQuantity('');
      setReason('');
      setNotes('');
      setWarehouseId(profile?.permissions?.warehouseIds?.[0] || '');
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
    setWarehouseId('');
    setAdjustmentType('increase');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>{t('products.adjustStock')}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {product.title}
            <br />
            {t('products.sku')}: {product.sku}
            <br />
            {t('products.currentStock')}: {product.stockQuantity} {product.unitMeasure}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                  ➕ {t('products.add')}
                </span>
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
                  ➖ {t('products.remove')}
                </span>
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
                  ⚡ {t('products.set')}
                </span>
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
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium">
                📊 {t('products.preview')}: {preview.before} → {preview.after} {product.unitMeasure} ({preview.change})
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('products.reason')} <span className="text-red-500">*</span>
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder={t('products.selectReason')} />
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

          {/* Warehouse */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('products.warehouse')} ({t('products.optional')})
            </label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger>
                <SelectValue placeholder={t('products.selectWarehouse')} />
              </SelectTrigger>
              <SelectContent>
                {mockWarehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
