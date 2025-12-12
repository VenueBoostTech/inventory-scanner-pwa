import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useStockCount, useUpdateStockCount, useCompleteStockCount } from '@/hooks/api/useStockCounts';
import { useProducts } from '@/hooks/api/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Coffee,
  Search,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Pause,
  CheckCircle,
  ArrowRight,
  SkipForward,
} from 'lucide-react';
import { format } from 'date-fns';

export function CountingScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [countedQuantity, setCountedQuantity] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [applyAdjustments, setApplyAdjustments] = useState(true);

  // API hooks
  const { data: count, isLoading: countLoading } = useStockCount(id || '');
  const { data: productsData } = useProducts({ 
    warehouseId: count?.warehouse.id,
    limit: 1000,
  });
  const { mutateAsync: updateStockCount, isPending: isUpdating } = useUpdateStockCount();
  const { mutateAsync: completeStockCount, isPending: isCompleting } = useCompleteStockCount();

  const products = productsData?.data || [];
  const countedItems = count?.items || [];
  const countedProductIds = new Set(countedItems.map(item => item.productId));
  const uncountedProducts = products.filter(p => !countedProductIds.has(p.id));
  const currentProduct = currentProductId ? products.find(p => p.id === currentProductId) : uncountedProducts[0] || null;

  // Initialize current product if not set
  useEffect(() => {
    if (!currentProductId && uncountedProducts.length > 0) {
      setCurrentProductId(uncountedProducts[0].id);
    }
  }, [uncountedProducts, currentProductId]);

  const discrepancy = useMemo(() => {
    if (!countedQuantity || !currentProduct) return null;
    const counted = parseFloat(countedQuantity);
    if (isNaN(counted)) return null;
    const expectedQty = currentProduct.stockQuantity || 0;
    return counted - expectedQty;
  }, [countedQuantity, currentProduct]);

  const handleSaveAndNext = async () => {
    if (!countedQuantity || !currentProduct || !id) {
      toast({
        title: t('common.error'),
        description: t('operations.enterQuantity'),
        variant: 'destructive',
      });
      return;
    }

    const qty = parseFloat(countedQuantity);
    if (isNaN(qty) || qty < 0) {
      toast({
        title: t('common.error'),
        description: t('operations.quantityMustBeValid'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateStockCount({
        countId: id,
        items: [{
          productId: currentProduct.id,
          countedQuantity: qty,
          notes: currentNotes || undefined,
        }],
      });
      toast({
        title: t('operations.itemSaved'),
        description: t('operations.itemSavedDesc'),
      });

      // Move to next uncounted product
      const currentIndex = uncountedProducts.findIndex((p) => p.id === currentProduct.id);
      if (currentIndex < uncountedProducts.length - 1) {
        setCurrentProductId(uncountedProducts[currentIndex + 1].id);
      } else if (uncountedProducts.length > 0) {
        setCurrentProductId(uncountedProducts[0].id);
      } else {
        setCurrentProductId(null);
      }
      setCountedQuantity('');
      setCurrentNotes('');
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('operations.itemSavedDesc'),
        variant: 'destructive',
      });
    }
  };

  const handleSkip = () => {
    if (!currentProduct) return;
    const currentIndex = uncountedProducts.findIndex((p) => p.id === currentProduct.id);
    if (currentIndex < uncountedProducts.length - 1) {
      setCurrentProductId(uncountedProducts[currentIndex + 1].id);
    } else if (uncountedProducts.length > 0) {
      setCurrentProductId(uncountedProducts[0].id);
    } else {
      setCurrentProductId(null);
    }
    setCountedQuantity('');
    setCurrentNotes('');
  };

  const handlePause = () => {
    // TODO: Pause count
    toast({
      title: t('operations.countPaused'),
      description: t('operations.countPausedDesc'),
    });
    navigate('/operations/counts');
  };

  const handleComplete = () => {
    setCompleteModalOpen(true);
  };

  const handleCompleteCount = async () => {
    if (!id) return;
    
    try {
      await completeStockCount({
        countId: id,
        autoAdjust: applyAdjustments,
        notes: '',
      });
      toast({
        title: t('operations.countCompleted'),
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

  const totalDiscrepancies = countedItems.filter((item) => item.variance !== 0).length;
  const totalMatched = countedItems.filter((item) => item.variance === 0).length;
  const totalSurplus = countedItems
    .filter((item) => item.variance > 0)
    .reduce((sum, item) => sum + item.variance, 0);
  const totalShortage = countedItems
    .filter((item) => item.variance < 0)
    .reduce((sum, item) => sum + item.variance, 0);

  // Calculate progress
  const progress = count && products.length > 0 
    ? Math.round((countedItems.length / products.length) * 100) 
    : 0;

  if (countLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('operations.stockCount')} showBack={false} />
        <div className="space-y-4 px-4 py-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!count) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ScreenHeader title={t('operations.stockCount')} showBack={false} />
        <div className="space-y-4 px-4 py-4">
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t('common.notFound')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader
        title={`${t('operations.stockCount')} #${count.referenceNumber}`}
        showBack={false}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              className="gap-2"
            >
              <Pause className="h-4 w-4" />
              {t('operations.pause')}
            </Button>
            <Button
              size="sm"
              onClick={handleComplete}
              disabled={isCompleting}
              className="gap-2 border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              <CheckCircle className="h-4 w-4" />
              {isCompleting ? t('common.loading') : t('operations.completeCount')}
            </Button>
          </div>
        }
      />
      <div className="space-y-4 px-4 py-4">
        {/* Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">{t('operations.warehouse')}:</span> {count.warehouse?.name || '-'}
          </div>
          <div>
            <span className="font-medium">{t('operations.started')}:</span>{' '}
            {count.startedAt ? format(new Date(count.startedAt), 'MMM d, yyyy, h:mm a') : '-'}
          </div>
          <div>
            <span className="font-medium">{t('operations.by')}:</span> {count.performedBy?.name || '-'}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {t('operations.progress')}: {countedItems.length}/{products.length} {t('operations.items')} ({progress}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-[#164945] h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('operations.searchOrScanProduct')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Camera className="h-4 w-4" />
            {t('scan.title')}
          </Button>
        </div>

        {/* Current Item */}
        {currentProduct ? (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">{t('operations.currentItem')}</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Coffee className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{currentProduct.title}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground mt-1">
                        <div>
                          <span className="font-medium">SKU:</span> {currentProduct.sku}
                        </div>
                        {currentProduct.location && (
                          <div>
                            <span className="font-medium">{t('operations.location')}:</span> {currentProduct.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">{t('operations.systemQuantity')}</label>
                      <p className="text-sm font-medium">{currentProduct.stockQuantity || 0}</p>
                    </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      {t('operations.countedQuantity')} <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={countedQuantity}
                      onChange={(e) => setCountedQuantity(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {discrepancy !== null && (
                    <div>
                      <label className="text-xs text-muted-foreground">{t('operations.difference')}</label>
                      <p className={`text-sm font-semibold ${discrepancy === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {discrepancy > 0 ? '+' : ''}{discrepancy} {discrepancy !== 0 && '⚠️'}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      {t('operations.notes')} ({t('operations.optional')})
                    </label>
                    <Input
                      placeholder={t('operations.notesPlaceholder')}
                      value={currentNotes}
                      onChange={(e) => setCurrentNotes(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSkip}
                      className="flex-1 gap-2"
                    >
                      <SkipForward className="h-4 w-4" />
                      {t('operations.skip')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveAndNext}
                      className="flex-1 gap-2 border-none bg-[#164945] text-white hover:bg-[#123b37]"
                    >
                      {t('operations.saveAndNext')}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        ) : null}

        {/* Counted Items */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {t('operations.countedItems')} ({countedItems.length})
              </h3>
              <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">{t('operations.product')}</TableHead>
                      <TableHead className="min-w-[80px]">{t('operations.system')}</TableHead>
                      <TableHead className="min-w-[80px]">{t('operations.counted')}</TableHead>
                      <TableHead className="min-w-[70px]">{t('operations.diff')}</TableHead>
                      <TableHead className="min-w-[80px]">{t('operations.status')}</TableHead>
                      <TableHead className="min-w-[100px]">{t('operations.time')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {countedItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">{item.productSku}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{item.expectedQuantity}</TableCell>
                        <TableCell className="text-sm">{item.countedQuantity}</TableCell>
                        <TableCell className={`text-sm font-semibold ${item.variance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.variance > 0 ? '+' : ''}{item.variance}
                        </TableCell>
                        <TableCell>
                          {item.variance === 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.countedAt ? format(new Date(item.countedAt), 'h:mm a') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Items */}
        {uncountedProducts.length > 0 && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('operations.pendingItems')} ({uncountedProducts.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('operations.next')}: {uncountedProducts.slice(0, 3).map(p => `${p.title} (${p.sku})`).join(', ')}
                  {uncountedProducts.length > 3 ? '...' : ''}
                </p>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {t('operations.showAllProducts')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Complete Count Modal */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>{t('operations.completeStockCount')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('operations.completeCountWarning')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">{t('operations.summary')}</h3>
              <Card className="border border-border bg-muted/50 shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('operations.totalItems')}:</span>
                      <span className="ml-2 font-medium">{products.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('operations.itemsCounted')}:</span>
                      <span className="ml-2 font-medium">{countedItems.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('operations.itemsMatched')}:</span>
                      <span className="ml-2 font-medium">{totalMatched}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('operations.itemsWithVariance')}:</span>
                      <span className="ml-2 font-medium">{totalDiscrepancies}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('operations.totalSurplus')}:</span>
                      <span className="ml-2 font-medium text-emerald-600">+{totalSurplus} {t('operations.units')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('operations.totalShortage')}:</span>
                      <span className="ml-2 font-medium text-red-600">{totalShortage} {t('operations.units')}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">{t('operations.netDifference')}:</span>
                      <span className={`ml-2 font-medium ${totalSurplus + totalShortage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {totalSurplus + totalShortage > 0 ? '+' : ''}{totalSurplus + totalShortage} {t('operations.units')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Discrepancies */}
            {totalDiscrepancies > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">
                  {t('operations.discrepancies')} ({totalDiscrepancies} {t('operations.items')})
                </h3>
                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">{t('operations.product')}</TableHead>
                        <TableHead className="min-w-[80px]">{t('operations.system')}</TableHead>
                        <TableHead className="min-w-[80px]">{t('operations.counted')}</TableHead>
                        <TableHead className="min-w-[70px]">{t('operations.diff')}</TableHead>
                        <TableHead className="min-w-[120px]">{t('operations.valueImpact')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {countedItems
                        .filter((item) => item.variance !== 0)
                        .map((item) => (
                          <TableRow key={item.productId}>
                            <TableCell>
                              <div>
                                <div className="text-sm font-medium">{item.productName}</div>
                                <div className="text-xs text-muted-foreground">{item.productSku}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{item.expectedQuantity}</TableCell>
                            <TableCell className="text-sm">{item.countedQuantity}</TableCell>
                            <TableCell className={`text-sm font-semibold ${item.variance > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {item.variance > 0 ? '+' : ''}{item.variance}
                            </TableCell>
                            <TableCell className={`text-sm font-semibold ${item.variance > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {item.variance > 0 ? '+' : ''}€{(item.variance * 12.5).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Apply Adjustments Checkbox */}
            <Card className="border border-border bg-muted/50 shadow-none">
              <CardContent className="px-3 py-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyAdjustments}
                    onChange={(e) => setApplyAdjustments(e.target.checked)}
                    className="h-4 w-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{t('operations.applyAdjustments')}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('operations.applyAdjustmentsDesc')}
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCompleteModalOpen(false)}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCompleteCount}
              disabled={isCompleting}
              className="w-full sm:w-auto border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {isCompleting ? t('common.loading') : t('operations.completeAndApply')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
