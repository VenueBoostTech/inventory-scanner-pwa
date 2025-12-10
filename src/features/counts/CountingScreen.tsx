import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Mock data
const mockCount = {
  id: 'cnt_005',
  code: 'CNT-005',
  status: 'in_progress',
  warehouse: { id: 'wh_001', name: 'Main Warehouse' },
  totalItems: 150,
  itemsCounted: 12,
  progress: 8,
  startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  createdBy: { id: 'staff_001', name: 'John Doe' },
};

const mockProducts = [
  {
    id: 'prod_001',
    title: 'Coffee Beans',
    sku: 'COF-001',
    location: 'Aisle 3, Shelf B',
    systemQuantity: 150,
  },
  {
    id: 'prod_002',
    title: 'Tea Bags',
    sku: 'TEA-001',
    location: 'Aisle 2, Shelf A',
    systemQuantity: 80,
  },
  {
    id: 'prod_003',
    title: 'Sugar',
    sku: 'SUG-001',
    location: 'Aisle 1, Shelf C',
    systemQuantity: 100,
  },
  {
    id: 'prod_004',
    title: 'Milk',
    sku: 'MLK-001',
    location: 'Aisle 4, Shelf A',
    systemQuantity: 50,
  },
  {
    id: 'prod_005',
    title: 'Honey',
    sku: 'HON-001',
    location: 'Aisle 2, Shelf B',
    systemQuantity: 40,
  },
];

const mockCountedItems = [
  {
    productId: 'prod_002',
    productName: 'Tea Bags',
    sku: 'TEA-001',
    systemQuantity: 80,
    countedQuantity: 80,
    discrepancy: 0,
    status: 'match',
    countedAt: new Date(Date.now() - 105 * 60 * 1000),
  },
  {
    productId: 'prod_003',
    productName: 'Sugar',
    sku: 'SUG-001',
    systemQuantity: 100,
    countedQuantity: 105,
    discrepancy: 5,
    status: 'discrepancy',
    countedAt: new Date(Date.now() - 100 * 60 * 1000),
  },
  {
    productId: 'prod_004',
    productName: 'Milk',
    sku: 'MLK-001',
    systemQuantity: 50,
    countedQuantity: 50,
    discrepancy: 0,
    status: 'match',
    countedAt: new Date(Date.now() - 95 * 60 * 1000),
  },
  {
    productId: 'prod_005',
    productName: 'Honey',
    sku: 'HON-001',
    systemQuantity: 40,
    countedQuantity: 38,
    discrepancy: -2,
    status: 'discrepancy',
    countedAt: new Date(Date.now() - 90 * 60 * 1000),
  },
];

export function CountingScreen() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [currentProduct, setCurrentProduct] = useState(mockProducts[0]);
  const [countedQuantity, setCountedQuantity] = useState('');
  const [currentNotes, setCurrentNotes] = useState('');
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [applyAdjustments, setApplyAdjustments] = useState(true);

  const discrepancy = useMemo(() => {
    if (!countedQuantity) return null;
    const counted = parseFloat(countedQuantity);
    if (isNaN(counted)) return null;
    return counted - currentProduct.systemQuantity;
  }, [countedQuantity, currentProduct]);

  const handleSaveAndNext = () => {
    if (!countedQuantity) {
      toast({
        title: t('common.error'),
        description: t('operations.enterQuantity'),
        variant: 'destructive',
      });
      return;
    }

    // TODO: Save count item
    toast({
      title: t('operations.itemSaved'),
      description: t('operations.itemSavedDesc'),
    });

    // Move to next product
    const currentIndex = mockProducts.findIndex((p) => p.id === currentProduct.id);
    if (currentIndex < mockProducts.length - 1) {
      setCurrentProduct(mockProducts[currentIndex + 1]);
      setCountedQuantity('');
      setCurrentNotes('');
    }
  };

  const handleSkip = () => {
    const currentIndex = mockProducts.findIndex((p) => p.id === currentProduct.id);
    if (currentIndex < mockProducts.length - 1) {
      setCurrentProduct(mockProducts[currentIndex + 1]);
      setCountedQuantity('');
      setCurrentNotes('');
    }
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

  const handleCompleteCount = () => {
    // TODO: Complete count and optionally apply adjustments
    toast({
      title: t('operations.countCompleted'),
      description: t('operations.countCompletedDesc'),
    });
    navigate(`/operations/counts/${id}`);
  };

  const totalDiscrepancies = mockCountedItems.filter((item) => item.discrepancy !== 0).length;
  const totalMatched = mockCountedItems.filter((item) => item.discrepancy === 0).length;
  const totalSurplus = mockCountedItems
    .filter((item) => item.discrepancy > 0)
    .reduce((sum, item) => sum + item.discrepancy, 0);
  const totalShortage = mockCountedItems
    .filter((item) => item.discrepancy < 0)
    .reduce((sum, item) => sum + item.discrepancy, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader
        title={`${t('operations.stockCount')} #${mockCount.code}`}
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
              className="gap-2 border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              <CheckCircle className="h-4 w-4" />
              {t('operations.completeCount')}
            </Button>
          </div>
        }
      />
      <div className="space-y-4 px-4 py-4">
        {/* Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">{t('operations.warehouse')}:</span> {mockCount.warehouse.name}
          </div>
          <div>
            <span className="font-medium">{t('operations.started')}:</span>{' '}
            {format(mockCount.startedAt, 'MMM d, yyyy, h:mm a')}
          </div>
          <div>
            <span className="font-medium">{t('operations.by')}:</span> {mockCount.createdBy.name}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {t('operations.progress')}: {mockCount.itemsCounted}/{mockCount.totalItems} {t('operations.items')} ({mockCount.progress}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-[#164945] h-2 rounded-full transition-all"
              style={{ width: `${mockCount.progress}%` }}
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
                      <div>
                        <span className="font-medium">{t('operations.location')}:</span> {currentProduct.location}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">{t('operations.systemQuantity')}</label>
                    <p className="text-sm font-medium">{currentProduct.systemQuantity}</p>
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

        {/* Counted Items */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                {t('operations.countedItems')} ({mockCountedItems.length})
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
                    {mockCountedItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">{item.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{item.systemQuantity}</TableCell>
                        <TableCell className="text-sm">{item.countedQuantity}</TableCell>
                        <TableCell className={`text-sm font-semibold ${item.discrepancy === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.discrepancy > 0 ? '+' : ''}{item.discrepancy}
                        </TableCell>
                        <TableCell>
                          {item.status === 'match' ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(item.countedAt, 'h:mm a')}
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
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('operations.pendingItems')} ({mockCount.totalItems - mockCount.itemsCounted})
                </h3>
                <Button variant="outline" size="sm" className="text-xs">
                  {t('operations.showAllProducts')}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('operations.next')}: Olive Oil (OIL-001), Vinegar (VIN-001), Salt (SAL-001)...
              </p>
            </div>
          </CardContent>
        </Card>
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
                      <span className="ml-2 font-medium">{mockCount.totalItems}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('operations.itemsCounted')}:</span>
                      <span className="ml-2 font-medium">{mockCount.itemsCounted}</span>
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
                      {mockCountedItems
                        .filter((item) => item.discrepancy !== 0)
                        .map((item) => (
                          <TableRow key={item.productId}>
                            <TableCell>
                              <div>
                                <div className="text-sm font-medium">{item.productName}</div>
                                <div className="text-xs text-muted-foreground">{item.sku}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{item.systemQuantity}</TableCell>
                            <TableCell className="text-sm">{item.countedQuantity}</TableCell>
                            <TableCell className={`text-sm font-semibold ${item.discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {item.discrepancy > 0 ? '+' : ''}{item.discrepancy}
                            </TableCell>
                            <TableCell className={`text-sm font-semibold ${item.discrepancy > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {item.discrepancy > 0 ? '+' : ''}€{(item.discrepancy * 12.5).toFixed(2)}
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
              className="w-full sm:w-auto border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {t('operations.completeAndApply')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
