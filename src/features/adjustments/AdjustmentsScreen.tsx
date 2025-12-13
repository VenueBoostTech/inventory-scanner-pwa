import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useActivities, useMyActivities } from '@/hooks/api/useActivities';
import { useProducts } from '@/hooks/api/useProducts';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { useProductWarehouses } from '@/hooks/api/useProductWarehouses';
import { useStockAdjustment } from '@/hooks/api/useStockAdjustment';
import { Package, Plus, Search as SearchIcon, Filter, TrendingUp, TrendingDown, Minus, Eye, AlertTriangle, Loader2, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { authStore } from '@/stores/authStore';
import { Skeleton } from '@/components/ui/skeleton';

const getDateRange = (filter: string) => {
  const now = new Date();
  let dateFrom: string | undefined;
  let dateTo: string | undefined;

  switch (filter) {
    case 'today':
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      dateFrom = todayStart.toISOString();
      dateTo = now.toISOString();
      break;
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      dateFrom = yesterday.toISOString();
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      dateTo = yesterdayEnd.toISOString();
      break;
    case 'last7':
      const last7 = new Date(now);
      last7.setDate(now.getDate() - 7);
      dateFrom = last7.toISOString();
      dateTo = now.toISOString();
      break;
    case 'last30':
      const last30 = new Date(now);
      last30.setDate(now.getDate() - 30);
      dateFrom = last30.toISOString();
      dateTo = now.toISOString();
      break;
    default:
      dateFrom = undefined;
      dateTo = undefined;
  }
  return { dateFrom, dateTo };
};

export function AdjustmentsScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const canAdjustStock = authStore((state) => state.canAdjustStock());
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [productFilter, setProductFilter] = useState<string>('all');
  const [productFilterSearch, setProductFilterSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease' | 'set'>('increase');
  const [quantity, setQuantity] = useState('');
  const [enableWarehouse, setEnableWarehouse] = useState(true);
  const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  // Get warehouses and products for filters
  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const warehouses = warehousesData?.data || [];
  const { data: productsResponse } = useProducts({ limit: 1000 });
  const products = productsResponse?.data || [];
  const { mutateAsync: adjustStock } = useStockAdjustment();
  
  // Fetch warehouses where product has stock when warehouse tracking is enabled
  const { data: productWarehousesData, isLoading: loadingWarehouses } = useProductWarehouses(
    enableWarehouse && selectedProduct ? selectedProduct.id : null
  );
  const availableWarehouses = productWarehousesData?.warehouses || [];

  // Calculate date range for API
  const { dateFrom, dateTo } = useMemo(() => getDateRange(dateRangeFilter), [dateRangeFilter]);

  // Determine filters for API
  const productId = useMemo(() => {
    if (productFilter === 'all') return undefined;
    const selectedProduct = products.find((p) => p.id === productFilter || p.title === productFilter);
    return selectedProduct?.id;
  }, [productFilter, products]);

  const warehouseId = useMemo(() => {
    if (warehouseFilter === 'all') return undefined;
    const selectedWarehouse = warehouses.find((wh) => wh.id === warehouseFilter || wh.name === warehouseFilter);
    return selectedWarehouse?.id;
  }, [warehouseFilter, warehouses]);

  // Use appropriate hook based on showMineOnly
  const { data: adjustmentsData, isLoading } = showMineOnly
    ? useMyActivities({
        page: currentPage,
        limit: 20,
        activityType: 'adjustment',
        productId,
        warehouseId,
        dateFrom,
        dateTo,
      })
    : useActivities({
        page: currentPage,
        limit: 20,
        activityType: 'adjustment',
        productId,
        warehouseId,
        dateFrom,
        dateTo,
      });

  const adjustments = adjustmentsData?.data || [];
  const pagination = adjustmentsData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [showMineOnly, productFilter, warehouseFilter, dateRangeFilter]);

  // Populate product filter search when sidebar opens with a selected product
  useEffect(() => {
    if (filtersOpen && productFilter !== 'all' && !productFilterSearch) {
      const selectedProduct = products.find((p) => p.id === productFilter);
      if (selectedProduct) {
        setProductFilterSearch(selectedProduct.title);
      }
    }
  }, [filtersOpen, productFilter, products, productFilterSearch]);

  // Auto-pre-select warehouses when they're loaded
  useEffect(() => {
    if (enableWarehouse && availableWarehouses.length > 0 && selectedWarehouses.length === 0) {
      const warehouseIds = availableWarehouses
        .filter(wh => wh.currentStock >= 1)
        .map(wh => wh.id);
      setSelectedWarehouses(warehouseIds);
    }
  }, [enableWarehouse, availableWarehouses, selectedWarehouses.length, selectedProduct]);

  const getQuantityDisplay = (adjustment: any) => {
    const isSet = adjustment.stockAfter === adjustment.quantity && adjustment.stockBefore !== adjustment.quantity;
    if (isSet) {
      return `=${adjustment.quantity}`;
    }
    return adjustment.quantity > 0 ? `+${adjustment.quantity}` : `${adjustment.quantity}`;
  };

  const getQuantityColor = (adjustment: any) => {
    const isSet = adjustment.stockAfter === adjustment.quantity && adjustment.stockBefore !== adjustment.quantity;
    if (isSet) {
      return 'text-blue-600';
    }
    return adjustment.quantity > 0 ? 'text-emerald-600' : 'text-red-600';
  };

  const getAdjustmentType = (adjustment: any) => {
    const isSet = adjustment.stockAfter === adjustment.quantity && adjustment.stockBefore !== adjustment.quantity;
    if (isSet) return 'set';
    return adjustment.quantity > 0 ? 'increase' : 'decrease';
  };

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

  const handleCreate = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setProductSearch('');
    setSelectedProduct(null);
    setAdjustmentType('increase');
    setQuantity('');
    setEnableWarehouse(false);
    setSelectedWarehouses([]);
    setReason('');
    setNotes('');
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    const searchLower = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchLower))
    );
  }, [productSearch, products]);

  const filteredProductsForFilter = useMemo(() => {
    if (!productFilterSearch) return products.slice(0, 50); // Show first 50 when no search
    const searchLower = productFilterSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchLower))
    ).slice(0, 100); // Limit to 100 results
  }, [productFilterSearch, products]);

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setProductSearch(product.title);
    setSelectedWarehouses([]);
  };

  const toggleWarehouse = (warehouseId: string) => {
    setSelectedWarehouses(prev =>
      prev.includes(warehouseId)
        ? prev.filter(id => id !== warehouseId)
        : [...prev, warehouseId]
    );
  };

  const calculatePreview = () => {
    if (!selectedProduct || !quantity) return null;
    const qty = parseFloat(quantity);
    if (isNaN(qty)) return null;

    const currentStock = selectedProduct.stockQuantity || 0;
    let stockAfter = currentStock;
    if (adjustmentType === 'increase') {
      stockAfter = currentStock + qty;
    } else if (adjustmentType === 'decrease') {
      stockAfter = Math.max(0, currentStock - qty);
    } else if (adjustmentType === 'set') {
      stockAfter = qty;
    }

    return {
      before: currentStock,
      after: stockAfter,
      change: adjustmentType === 'set' ? `=${qty}` : adjustmentType === 'increase' ? `+${qty}` : `-${qty}`,
    };
  };

  const preview = calculatePreview();

  const handleSave = async () => {
    if (!selectedProduct || !quantity || !reason) {
      toast({
        title: t('common.error'),
        description: t('operations.fillRequiredFields'),
        variant: 'destructive',
      });
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: t('common.error'),
        description: t('operations.quantityMustBeValid'),
        variant: 'destructive',
      });
      return;
    }

    try {
      let adjustmentQuantity = qty;
      if (adjustmentType === 'decrease') {
        adjustmentQuantity = -qty;
      } else if (adjustmentType === 'set') {
        const currentStock = selectedProduct.stockQuantity || 0;
        adjustmentQuantity = qty - currentStock;
      }

      const payload: any = {
        productId: selectedProduct.id,
        adjustmentType: adjustmentType,
        quantity: adjustmentType === 'set' ? qty : Math.abs(adjustmentQuantity),
        reason,
        notes: notes || undefined,
      };

      if (enableWarehouse && selectedWarehouses.length > 0) {
        payload.warehouseIds = selectedWarehouses;
      }

      await adjustStock(payload);
      toast({
        title: t('operations.adjustmentCreated'),
        description: t('operations.adjustmentCreatedDesc'),
      });
      handleCloseModal();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('operations.adjustmentError'),
        variant: 'destructive',
      });
    }
  };

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

  const handleViewDetails = (adjustment: any) => {
    navigate(`/operations/adjustments/${adjustment.id}`);
  };

  const clearFilters = () => {
    setProductFilter('all');
    setProductFilterSearch('');
    setWarehouseFilter('all');
    setDateRangeFilter('all');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (productFilter !== 'all') count++;
    if (warehouseFilter !== 'all') count++;
    if (dateRangeFilter !== 'all') count++;
    return count;
  }, [productFilter, warehouseFilter, dateRangeFilter]);

  const getActiveFilterLabel = (filterType: string, value: string) => {
    if (value === 'all') return '';
    switch (filterType) {
      case 'product':
        const product = products.find((p) => p.id === value || p.title === value);
        return product?.title || value;
      case 'warehouse':
        const warehouse = warehouses.find((wh) => wh.id === value || wh.name === value);
        return warehouse?.name || value;
      case 'dateRange':
        const labels: Record<string, string> = {
          today: t('operations.today'),
          yesterday: t('operations.yesterday'),
          last7: t('operations.last7Days'),
          last30: t('operations.last30Days'),
        };
        return labels[value] || value;
      default:
        return value;
    }
  };

  // Calculate pagination display
  const startItem = (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.stockAdjustments')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Create Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground">{t('operations.stockAdjustments')}</h1>
            <p className="text-sm text-muted-foreground">{t('operations.adjustmentsSubtitle')}</p>
          </div>
          {canAdjustStock && (
            <button
              onClick={handleCreate}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945] text-white hover:bg-[#123b37] transition-colors"
              title={t('operations.newAdjustment')}
            >
              <Plus className="h-5 w-5 fill-current" />
            </button>
          )}
        </div>

        {/* Filters and Toggle */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {t('common.filter')}
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
                <SheetHeader className="shrink-0">
                  <SheetTitle className="text-left">{t('common.filter')}</SheetTitle>
                  <SheetDescription className="text-left">{t('operations.filterAdjustments')}</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto scrollbar-hide pr-2 mt-4 space-y-4">
                  {/* Product Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-left">{t('operations.product')}</label>
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder={t('operations.searchProductPlaceholder')}
                        value={productFilterSearch}
                        onChange={(e) => {
                          setProductFilterSearch(e.target.value);
                          if (!e.target.value) setProductFilter('all');
                        }}
                        className="pl-9"
                      />
                    </div>
                    {productFilterSearch && (
                      <div className="border border-border rounded-md bg-white shadow-sm max-h-64 overflow-y-auto">
                        <button
                          onClick={() => {
                            setProductFilter('all');
                            setProductFilterSearch('');
                          }}
                          className={`w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border ${
                            productFilter === 'all' ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="font-medium text-sm">{t('operations.all')}</div>
                        </button>
                        {filteredProductsForFilter.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => {
                              setProductFilter(product.id);
                              setProductFilterSearch(product.title);
                            }}
                            className={`w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0 ${
                              productFilter === product.id ? 'bg-muted' : ''
                            }`}
                          >
                            <div className="font-medium text-sm">{product.title}</div>
                            <div className="text-xs text-muted-foreground">{product.sku}</div>
                          </button>
                        ))}
                        {filteredProductsForFilter.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                            {t('common.noData')}
                          </div>
                        )}
                      </div>
                    )}
                    {productFilter !== 'all' && !productFilterSearch && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                        <span className="text-sm flex-1 truncate">
                          {products.find(p => p.id === productFilter)?.title || ''}
                        </span>
                        <button
                          onClick={() => {
                            setProductFilter('all');
                            setProductFilterSearch('');
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Warehouse Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-left">{t('operations.warehouse')}</label>
                    <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('operations.allWarehouses')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('operations.all')}</SelectItem>
                        {warehouses.map((wh) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-left">{t('operations.dateRange')}</label>
                    <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('operations.allDates')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('operations.all')}</SelectItem>
                        <SelectItem value="today">{t('operations.today')}</SelectItem>
                        <SelectItem value="yesterday">{t('operations.yesterday')}</SelectItem>
                        <SelectItem value="last7">{t('operations.last7Days')}</SelectItem>
                        <SelectItem value="last30">{t('operations.last30Days')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SheetFooter className="border-t pt-4 shrink-0 gap-2">
                  <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                    {t('products.clearFilters')}
                  </Button>
                  <Button
                    onClick={() => setFiltersOpen(false)}
                    className="w-full sm:w-auto border-none bg-[#164945] text-white hover:bg-[#123b37]"
                  >
                    {t('common.apply')}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {productFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {t('operations.product')}: {getActiveFilterLabel('product', productFilter)}
                    <button
                      onClick={() => {
                        setProductFilter('all');
                        setProductFilterSearch('');
                      }}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {warehouseFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {t('operations.warehouse')}: {getActiveFilterLabel('warehouse', warehouseFilter)}
                    <button
                      onClick={() => setWarehouseFilter('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {dateRangeFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {t('operations.dateRange')}: {getActiveFilterLabel('dateRange', dateRangeFilter)}
                    <button
                      onClick={() => setDateRangeFilter('all')}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Show Mine Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showMineOnly}
              onChange={(e) => setShowMineOnly(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#164945] focus:ring-[#164945]"
            />
            <span className="text-sm font-medium whitespace-nowrap">
              {t('operations.showOnlyMine')}
            </span>
          </label>
        </div>

        {/* Adjustments Table */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">{t('operations.product')}</TableHead>
                      <TableHead className="min-w-[140px] sm:min-w-[160px]">{t('operations.adjustmentType')}</TableHead>
                      <TableHead className="min-w-[70px]">{t('operations.quantity')}</TableHead>
                      <TableHead className="min-w-[110px] sm:min-w-[140px]">{t('operations.stock')}</TableHead>
                      <TableHead className="min-w-[100px] sm:min-w-[120px]">{t('operations.reason')}</TableHead>
                      <TableHead className="min-w-[100px] sm:min-w-[120px]">{t('operations.notes')}</TableHead>
                      <TableHead className="min-w-[90px] sm:min-w-[100px]">{t('operations.date')}</TableHead>
                      <TableHead className="min-w-[120px] sm:min-w-[150px]">{t('operations.initiatedBy')}</TableHead>
                      <TableHead className="min-w-[60px] text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adjustments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-sm text-muted-foreground">
                          {t('operations.noAdjustments')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      adjustments.map((adjustment) => {
                        const adjustmentType = getAdjustmentType(adjustment);
                        const TypeIcon = adjustmentType === 'increase' ? TrendingUp : adjustmentType === 'decrease' ? TrendingDown : Minus;
                        const typeColor = adjustmentType === 'increase' ? 'text-emerald-600' : adjustmentType === 'decrease' ? 'text-red-600' : 'text-blue-600';
                        
                        return (
                          <TableRow key={adjustment.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {adjustment.product.imagePath ? (
                                  <>
                                    <img
                                      src={adjustment.product.imagePath}
                                      alt={adjustment.product.title}
                                      className="h-10 w-10 rounded object-cover shrink-0"
                                      loading="lazy"
                                      decoding="async"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.classList.remove('hidden');
                                      }}
                                    />
                                    <Package className="h-10 w-10 rounded bg-muted text-muted-foreground p-2 shrink-0 hidden" />
                                  </>
                                ) : (
                                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm truncate">{adjustment.product.title}</div>
                                  <div className="text-xs text-muted-foreground truncate">{adjustment.product.sku}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <TypeIcon className={`h-4 w-4 ${typeColor} shrink-0`} />
                                <span className="text-sm">{getTypeLabel(adjustmentType)}</span>
                              </div>
                            </TableCell>
                          <TableCell>
                            <span className={`text-sm font-semibold ${getQuantityColor(adjustment)}`}>
                              {getQuantityDisplay(adjustment)}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {adjustment.stockBefore ?? '—'} → {adjustment.stockAfter ?? '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <div className="max-w-[120px] sm:max-w-[150px] truncate" title={adjustment.reason || '—'}>
                              {adjustment.reason || '—'}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <div className="max-w-[120px] sm:max-w-[150px] truncate" title={adjustment.notes || '—'}>
                              {adjustment.notes || '—'}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {adjustment.createdAt?.formattedDateTime || adjustment.createdAt?.date || '—'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {adjustment.staff ? (
                              <div className="font-medium text-foreground truncate" title={adjustment.staff.name}>
                                {adjustment.staff.name}
                              </div>
                            ) : (
                              <span>{t('operations.system')}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              onClick={() => handleViewDetails(adjustment)}
                              className="p-1 hover:bg-muted rounded"
                              title={t('operations.viewDetails')}
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </TableCell>
                        </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="text-sm text-muted-foreground">
              {t('operations.showing')} {startItem}-{endItem} {t('operations.of')} {pagination.total}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9 px-3"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">{t('operations.prev')}</span>
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-9 min-w-9 ${
                        currentPage === pageNum
                          ? 'bg-[#164945] text-white hover:bg-[#123b37]'
                          : ''
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="h-9 px-3"
              >
                <span className="hidden sm:inline mr-1">{t('operations.next')}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <Card className="border border-amber-200 bg-amber-50/50 shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  {t('operations.note')}
                </p>
                <p className="text-xs text-amber-800">
                  {t('operations.adjustmentsImmutable')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Adjustment Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>{t('operations.newAdjustment')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('operations.product')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('operations.searchProductPlaceholder')}
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    if (!e.target.value) setSelectedProduct(null);
                  }}
                  className="pl-9"
                />
              </div>
              {productSearch && !selectedProduct && filteredProducts.length > 0 && (
                <div className="border border-border rounded-md bg-white shadow-sm max-h-48 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="font-medium text-sm">{product.title}</div>
                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Product Info */}
            {selectedProduct && (
              <Card className="border border-border bg-muted/50 shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="flex items-start gap-3">
                    {selectedProduct.imagePath ? (
                      <img
                        src={selectedProduct.imagePath}
                        alt={selectedProduct.title}
                        className="h-16 w-16 rounded object-cover shrink-0"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`h-16 w-16 rounded bg-muted flex items-center justify-center shrink-0 ${selectedProduct.imagePath ? 'hidden' : ''}`}>
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium">{selectedProduct.title}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">SKU:</span> {selectedProduct.sku}
                        </div>
                        <div>
                          <span className="font-medium">{t('operations.currentStock')}:</span> {selectedProduct.stockQuantity || 0} {t('operations.units')}
                        </div>
                        <div>
                          <span className="font-medium">{t('operations.lowThreshold')}:</span> {selectedProduct.lowQuantity || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Adjustment Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('operations.adjustmentType')} <span className="text-red-500">*</span>
              </label>
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
                {t('operations.quantity')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="50"
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
            {enableWarehouse && selectedProduct && (
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
                {t('operations.notes')} ({t('operations.optional')})
              </label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t('operations.notesPlaceholder')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseModal} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              className="w-full sm:w-auto border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {t('operations.saveAdjustment')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
