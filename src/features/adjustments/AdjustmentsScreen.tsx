import { useState, useMemo } from 'react';
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
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus, Search, Filter, TrendingUp, TrendingDown, Minus, Eye, AlertTriangle, Coffee } from 'lucide-react';
import { format } from 'date-fns';

// Mock products for search
const mockProducts = [
  {
    id: 'prod_001',
    title: 'Coffee Beans',
    sku: 'COF-001',
    barcode: '8901234567890',
    currentStock: 150,
    lowThreshold: 20,
  },
  {
    id: 'prod_002',
    title: 'Tea Bags',
    sku: 'TEA-001',
    barcode: '8901234567891',
    currentStock: 80,
    lowThreshold: 15,
  },
  {
    id: 'prod_003',
    title: 'Sugar',
    sku: 'SUG-001',
    barcode: '8901234567892',
    currentStock: 180,
    lowThreshold: 30,
  },
  {
    id: 'prod_004',
    title: 'Milk',
    sku: 'MLK-001',
    barcode: '8901234567893',
    currentStock: 0,
    lowThreshold: 10,
  },
  {
    id: 'prod_005',
    title: 'Honey',
    sku: 'HON-001',
    barcode: '8901234567894',
    currentStock: 50,
    lowThreshold: 5,
  },
];

// Mock warehouses
const mockWarehouses = [
  { id: 'wh_001', name: 'Main Warehouse' },
  { id: 'wh_002', name: 'Secondary Warehouse' },
];

// Mock data
const mockAdjustments = [
  {
    id: 'adj_001',
    code: 'ADJ-001',
    product: { id: 'prod_001', title: 'Coffee Beans', sku: 'COF-001' },
    adjustmentType: 'increase',
    quantity: 50,
    stockBefore: 100,
    stockAfter: 150,
    reason: 'Received shipment',
    notes: 'PO #12345 - Received from Supplier ABC',
    reference: 'PO-12345',
    warehouse: { id: 'wh_001', name: 'Main Warehouse' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdBy: { id: 'staff_001', name: 'John D.' },
  },
  {
    id: 'adj_002',
    code: 'ADJ-002',
    product: { id: 'prod_002', title: 'Tea Bags', sku: 'TEA-001' },
    adjustmentType: 'decrease',
    quantity: -5,
    stockBefore: 80,
    stockAfter: 75,
    reason: 'Damaged items',
    warehouse: { id: 'wh_001', name: 'Main Warehouse' },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdBy: { id: 'staff_002', name: 'Sarah M.' },
  },
  {
    id: 'adj_003',
    code: 'ADJ-003',
    product: { id: 'prod_003', title: 'Sugar', sku: 'SUG-001' },
    adjustmentType: 'set',
    quantity: 200,
    stockBefore: 180,
    stockAfter: 200,
    reason: 'Inventory correction',
    warehouse: { id: 'wh_001', name: 'Main Warehouse' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdBy: { id: 'staff_003', name: 'Mike T.' },
  },
  {
    id: 'adj_004',
    code: 'ADJ-004',
    product: { id: 'prod_004', title: 'Milk', sku: 'MLK-001' },
    adjustmentType: 'increase',
    quantity: 100,
    stockBefore: 0,
    stockAfter: 100,
    reason: 'Received shipment',
    warehouse: { id: 'wh_001', name: 'Main Warehouse' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdBy: { id: 'staff_001', name: 'John D.' },
  },
  {
    id: 'adj_005',
    code: 'ADJ-005',
    product: { id: 'prod_005', title: 'Honey', sku: 'HON-001' },
    adjustmentType: 'decrease',
    quantity: -10,
    stockBefore: 50,
    stockAfter: 40,
    reason: 'Expired items',
    warehouse: { id: 'wh_001', name: 'Main Warehouse' },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    createdBy: { id: 'staff_002', name: 'Sarah M.' },
  },
];

type SortOption = 'recent' | 'type' | 'warehouse';

export function AdjustmentsScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease' | 'set'>('increase');
  const [quantity, setQuantity] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [reference, setReference] = useState('');

  const filteredAndSortedAdjustments = useMemo(() => {
    let filtered = [...mockAdjustments];

    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (adj) =>
          adj.code.toLowerCase().includes(searchLower) ||
          adj.product.title.toLowerCase().includes(searchLower) ||
          adj.product.sku.toLowerCase().includes(searchLower) ||
          (adj.reference && adj.reference.toLowerCase().includes(searchLower))
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((adj) => adj.adjustmentType === typeFilter);
    }

    // Apply warehouse filter
    if (warehouseFilter !== 'all') {
      const warehouseNameLower = warehouseFilter.toLowerCase();
      filtered = filtered.filter((adj) => {
        const adjWarehouseLower = adj.warehouse.name.toLowerCase();
        return warehouseNameLower === 'main' 
          ? adjWarehouseLower.includes('main')
          : adjWarehouseLower.includes('secondary');
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'type':
          return a.adjustmentType.localeCompare(b.adjustmentType);
        case 'warehouse':
          return a.warehouse.name.localeCompare(b.warehouse.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [search, typeFilter, warehouseFilter, sortBy]);

  const getQuantityDisplay = (adjustment: any) => {
    if (adjustment.adjustmentType === 'set') {
      return `=${adjustment.quantity}`;
    }
    return adjustment.quantity > 0 ? `+${adjustment.quantity}` : `${adjustment.quantity}`;
  };

  const getQuantityColor = (adjustment: any) => {
    if (adjustment.adjustmentType === 'set') {
      return 'text-blue-600';
    }
    return adjustment.quantity > 0 ? 'text-emerald-600' : 'text-red-600';
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
    // Reset form
    setProductSearch('');
    setSelectedProduct(null);
    setAdjustmentType('increase');
    setQuantity('');
    setWarehouse('');
    setReason('');
    setNotes('');
    setReference('');
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    const searchLower = productSearch.toLowerCase();
    return mockProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        p.barcode.includes(searchLower)
    );
  }, [productSearch]);

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setProductSearch(product.title);
  };

  const calculatePreview = () => {
    if (!selectedProduct || !quantity) return null;
    const qty = parseFloat(quantity);
    if (isNaN(qty)) return null;

    let stockAfter = selectedProduct.currentStock;
    if (adjustmentType === 'increase') {
      stockAfter = selectedProduct.currentStock + qty;
    } else if (adjustmentType === 'decrease') {
      stockAfter = Math.max(0, selectedProduct.currentStock - qty);
    } else if (adjustmentType === 'set') {
      stockAfter = qty;
    }

    return {
      before: selectedProduct.currentStock,
      after: stockAfter,
      change: adjustmentType === 'set' ? `=${qty}` : adjustmentType === 'increase' ? `+${qty}` : `-${qty}`,
    };
  };

  const preview = calculatePreview();

  const handleSave = () => {
    if (!selectedProduct || !quantity || !reason) {
      toast({
        title: t('common.error'),
        description: t('operations.fillRequiredFields'),
        variant: 'destructive',
      });
      return;
    }

    // TODO: Save adjustment to API
    toast({
      title: t('operations.adjustmentCreated'),
      description: t('operations.adjustmentCreatedDesc'),
    });
    handleCloseModal();
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
    setTypeFilter('all');
    setWarehouseFilter('all');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.stockAdjustments')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle with Create Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground">{t('operations.stockAdjustments')}</h1>
            <p className="text-sm text-muted-foreground">{t('operations.adjustmentsSubtitle')}</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945] text-white hover:bg-[#123b37] transition-colors"
            title={t('operations.newAdjustment')}
          >
            <Plus className="h-5 w-5 fill-current" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters and Sort Bar */}
        <div className="flex items-center justify-between gap-2">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {t('common.filter')}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="text-left space-y-1">
                <SheetTitle className="text-left">{t('common.filter')}</SheetTitle>
                <SheetDescription className="text-left">{t('operations.filterAdjustments')}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-left">{t('operations.adjustmentType')}</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: t('operations.all') },
                      { value: 'increase', label: t('operations.increase') },
                      { value: 'decrease', label: t('operations.decrease') },
                      { value: 'set', label: t('operations.set') },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="type"
                          value={option.value}
                          checked={typeFilter === option.value}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Warehouse Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-left">{t('operations.warehouse')}</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: t('operations.all') },
                      { value: 'main', label: 'Main Warehouse' },
                      { value: 'secondary', label: 'Secondary Warehouse' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="warehouse"
                          value={option.value}
                          checked={warehouseFilter === option.value}
                          onChange={(e) => setWarehouseFilter(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <SheetFooter className="mt-4 gap-2">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  {t('products.clearFilters')}
                </Button>
                <Button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                >
                  {t('common.apply')}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="h-10 w-[140px]">
              <SelectValue placeholder={t('common.sort')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t('products.sortRecent')}</SelectItem>
              <SelectItem value="type">{t('operations.adjustmentType')}</SelectItem>
              <SelectItem value="warehouse">{t('operations.warehouse')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Adjustments Table */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">ID</TableHead>
                    <TableHead className="min-w-[150px]">{t('operations.product')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('operations.adjustmentType')}</TableHead>
                    <TableHead className="min-w-[80px]">{t('operations.quantity')}</TableHead>
                    <TableHead className="min-w-[140px]">{t('operations.stock')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('operations.reason')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('operations.date')}</TableHead>
                    <TableHead className="min-w-[80px] text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedAdjustments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground">
                        {t('operations.noAdjustments')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedAdjustments.map((adjustment) => (
                      <TableRow key={adjustment.id}>
                        <TableCell className="font-medium">{adjustment.code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{adjustment.product.title}</div>
                            <div className="text-xs text-muted-foreground">{adjustment.product.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{getTypeLabel(adjustment.adjustmentType)}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-semibold ${getQuantityColor(adjustment)}`}>
                            {getQuantityDisplay(adjustment)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {adjustment.stockBefore} → {adjustment.stockAfter}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {adjustment.reason === 'Received shipment' 
                            ? t('operations.receivedShipment') 
                            : adjustment.reason === 'Damaged items' 
                            ? t('operations.damagedItems')
                            : adjustment.reason === 'Expired items'
                            ? t('operations.expiredItems')
                            : adjustment.reason === 'Inventory correction'
                            ? t('operations.inventoryCorrection')
                            : adjustment.reason}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(adjustment.createdAt, 'MMM d')}
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('operations.showing')} 1-10 {t('operations.of')} 320</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              {t('operations.prev')}
            </Button>
            <Button variant="outline" size="sm" className="bg-[#164945] text-white hover:bg-[#123b37]">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              {t('operations.next')}
            </Button>
          </div>
        </div>

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
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                    <Coffee className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium">{selectedProduct.title}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">SKU:</span> {selectedProduct.sku}
                        </div>
                        <div>
                          <span className="font-medium">{t('operations.currentStock')}:</span> {selectedProduct.currentStock} {t('operations.units')}
                        </div>
                        <div>
                          <span className="font-medium">{t('operations.lowThreshold')}:</span> {selectedProduct.lowThreshold}
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

            {/* Quantity and Warehouse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('operations.warehouse')} ({t('operations.optional')})
                </label>
                <Select value={warehouse} onValueChange={setWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('operations.selectWarehouse')} />
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
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground px-1">
                {commonReasons.slice(0, 4).map((r) => (
                  <div key={r.value}>• {r.label}</div>
                ))}
                {commonReasons.slice(4).map((r) => (
                  <div key={r.value}>• {r.label}</div>
                ))}
              </div>
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

            {/* Reference */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('operations.reference')} ({t('operations.optional')})
              </label>
              <Input
                placeholder="PO-12345"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
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
