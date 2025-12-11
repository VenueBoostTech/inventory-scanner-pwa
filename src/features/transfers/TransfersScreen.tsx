import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Truck, Plus, CheckCircle2, XCircle, AlertCircle, Search, Camera, Trash2, ArrowRight } from 'lucide-react';
import { format, isToday } from 'date-fns';

// Mock data
const mockTransfers = [
  {
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
  {
    id: 'trf_006',
    code: 'TRF-006',
    status: 'in_transit',
    fromWarehouse: { id: 'wh_002', name: 'Secondary Warehouse' },
    toWarehouse: { id: 'wh_001', name: 'Main Warehouse' },
    itemCount: 3,
    totalQuantity: 50,
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
  },
  {
    id: 'trf_005',
    code: 'TRF-005',
    status: 'completed',
    fromWarehouse: { id: 'wh_001', name: 'Main Warehouse' },
    toWarehouse: { id: 'wh_002', name: 'Secondary Warehouse' },
    itemCount: 10,
    totalQuantity: 200,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedBy: { id: 'staff_002', name: 'Sarah M.' },
  },
  {
    id: 'trf_004',
    code: 'TRF-004',
    status: 'cancelled',
    fromWarehouse: { id: 'wh_001', name: 'Main Warehouse' },
    toWarehouse: { id: 'wh_002', name: 'Secondary Warehouse' },
    itemCount: 2,
    cancelledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
];

const mockWarehouses = [
  { id: 'wh_001', name: 'Main Warehouse' },
  { id: 'wh_002', name: 'Secondary Warehouse' },
];

const mockProducts = [
  {
    id: 'prod_001',
    title: 'Coffee Beans',
    sku: 'COF-001',
    availableStock: 150,
  },
  {
    id: 'prod_002',
    title: 'Tea Bags',
    sku: 'TEA-001',
    availableStock: 80,
  },
  {
    id: 'prod_003',
    title: 'Sugar',
    sku: 'SUG-001',
    availableStock: 100,
  },
];

type TransferStatus = 'all' | 'pending' | 'in_transit' | 'completed' | 'cancelled';
type CreateStep = 'basic' | 'products' | 'confirmation';

export function TransfersScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<TransferStatus>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>('basic');
  const [fromWarehouse, setFromWarehouse] = useState('');
  const [toWarehouse, setToWarehouse] = useState('');
  const [transferItems, setTransferItems] = useState<Array<{ productId: string; productName: string; sku: string; quantity: number }>>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [itemQuantity, setItemQuantity] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [_confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const filteredTransfers = useMemo(() => {
    if (statusFilter === 'all') return mockTransfers;
    return mockTransfers.filter((t) => t.status === statusFilter);
  }, [statusFilter]);

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

  const filteredProducts = useMemo(() => {
    if (!productSearch) return [];
    const searchLower = productSearch.toLowerCase();
    return mockProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower)
    );
  }, [productSearch]);

  const handleCreate = () => {
    setCreateModalOpen(true);
    setCreateStep('basic');
    setFromWarehouse('');
    setToWarehouse('');
    setTransferItems([]);
    setTransferNotes('');
  };

  const handleCloseCreate = () => {
    setCreateModalOpen(false);
    setCreateStep('basic');
    setFromWarehouse('');
    setToWarehouse('');
    setTransferItems([]);
    setProductSearch('');
    setSelectedProduct(null);
    setItemQuantity('');
    setTransferNotes('');
  };

  const handleNextStep = () => {
    if (createStep === 'basic') {
      if (!fromWarehouse || !toWarehouse) {
        toast({
          title: t('common.error'),
          description: t('transfers.selectBothWarehouses'),
          variant: 'destructive',
        });
        return;
      }
      if (fromWarehouse === toWarehouse) {
        toast({
          title: t('common.error'),
          description: t('transfers.cannotTransferSameWarehouse'),
          variant: 'destructive',
        });
        return;
      }
      setCreateStep('products');
    } else if (createStep === 'products') {
      if (transferItems.length === 0) {
        toast({
          title: t('common.error'),
          description: t('transfers.addAtLeastOneProduct'),
          variant: 'destructive',
        });
        return;
      }
      setCreateStep('confirmation');
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !itemQuantity) {
      toast({
        title: t('common.error'),
        description: t('transfers.selectProductAndQuantity'),
        variant: 'destructive',
      });
      return;
    }
    const quantity = parseFloat(itemQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: t('common.error'),
        description: t('transfers.quantityMustBeGreaterThanZero'),
        variant: 'destructive',
      });
      return;
    }
    if (quantity > selectedProduct.availableStock) {
      toast({
        title: t('common.error'),
        description: t('transfers.notEnoughStock').replace('{available}', String(selectedProduct.availableStock)),
        variant: 'destructive',
      });
      return;
    }
    setTransferItems([...transferItems, {
      productId: selectedProduct.id,
      productName: selectedProduct.title,
      sku: selectedProduct.sku,
      quantity,
    }]);
    setSelectedProduct(null);
    setItemQuantity('');
    setProductSearch('');
  };

  const handleRemoveItem = (index: number) => {
    setTransferItems(transferItems.filter((_, i) => i !== index));
  };

  // handleCreateTransfer removed - unused

  const handleViewDetails = (transfer: any) => {
    navigate(`/operations/transfers/${transfer.id}`);
  };

  const handleComplete = (transfer: any) => {
    setSelectedTransfer(transfer);
    setCompleteModalOpen(true);
  };

  const handleCompleteTransfer = () => {
    // TODO: Complete transfer via API
    toast({
      title: t('transfers.transferCompleted'),
      description: t('transfers.transferCompletedDesc'),
    });
    setCompleteModalOpen(false);
    setSelectedTransfer(null);
  };

  const handleCancel = (_transfer: any) => {
    // TODO: Cancel transfer via API
    toast({
      title: t('transfers.transferCancelled'),
      description: t('transfers.transferCancelledDesc'),
    });
  };

  // handleMarkInTransit removed - unused

  const totalQuantity = useMemo(() => {
    return transferItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [transferItems]);

  const getDateDisplay = (date: Date) => {
    if (isToday(date)) {
      return t('operations.today') + ', ' + format(date, 'h:mm a');
    }
    return format(date, 'MMM d, yyyy');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.stockTransfers')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle with Create Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground">{t('operations.stockTransfers')}</h1>
            <p className="text-sm text-muted-foreground">{t('operations.transfersSubtitle')}</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945] text-white hover:bg-[#123b37] transition-colors"
            title={t('operations.newTransfer')}
          >
            <Plus className="h-5 w-5 fill-current" />
          </button>
        </div>

        {/* Status Tabs */}
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as TransferStatus)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              {t('operations.all')}
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">
              {t('operations.pending')}
            </TabsTrigger>
            <TabsTrigger value="in_transit" className="text-xs">
              {t('operations.inTransit')}
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              {t('operations.completed')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Transfers List */}
        <div className="space-y-3">
          {filteredTransfers.length === 0 ? (
            <Card className="border border-border bg-white shadow-none">
              <CardContent className="px-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">{t('transfers.noTransfers')}</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransfers.map((transfer) => (
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
                          <p className="text-sm text-muted-foreground">
                            {transfer.fromWarehouse.name} → {transfer.toWarehouse.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transfer.itemCount} {t('operations.items')} • {transfer.totalQuantity || 0} {t('operations.units')}
                          </p>
                          {transfer.status === 'pending' && transfer.createdAt && (
                            <p className="text-sm text-muted-foreground">
                              {t('operations.created')}: {getDateDisplay(transfer.createdAt)}
                            </p>
                          )}
                          {transfer.status === 'in_transit' && transfer.startedAt && (
                            <p className="text-sm text-muted-foreground">
                              {t('operations.started')}: {getDateDisplay(transfer.startedAt)}
                            </p>
                          )}
                          {transfer.status === 'completed' && transfer.completedAt && (
                            <p className="text-sm text-muted-foreground">
                              {t('operations.completed')}: {format(transfer.completedAt, 'MMM d, yyyy')}
                            </p>
                          )}
                          {transfer.status === 'cancelled' && transfer.cancelledAt && (
                            <p className="text-sm text-muted-foreground">
                              {t('operations.cancelled')}: {format(transfer.cancelledAt, 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {transfer.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleViewDetails(transfer)}
                            className="flex-1 h-10"
                          >
                            {t('operations.viewDetails')}
                          </Button>
                          <Button
                            className="flex-1 h-10 border-none bg-[#164945] text-white hover:bg-[#123b37]"
                            onClick={() => handleComplete(transfer)}
                          >
                            {t('operations.complete')}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 h-11 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancel(transfer)}
                          >
                            {t('operations.cancel')}
                          </Button>
                        </>
                      )}
                      {transfer.status === 'in_transit' && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => handleViewDetails(transfer)}
                            className="flex-1 h-10"
                          >
                            {t('operations.viewDetails')}
                          </Button>
                          <Button
                            className="flex-1 h-10 border-none bg-[#164945] text-white hover:bg-[#123b37]"
                            onClick={() => handleComplete(transfer)}
                          >
                            {t('operations.complete')}
                          </Button>
                        </>
                      )}
                      {transfer.status === 'completed' && (
                        <Button
                          variant="outline"
                          onClick={() => handleViewDetails(transfer)}
                          className="w-full h-10"
                        >
                          {t('operations.viewDetails')}
                        </Button>
                      )}
                      {transfer.status === 'cancelled' && (
                        <Button
                          variant="outline"
                          onClick={() => handleViewDetails(transfer)}
                          className="w-full h-10"
                        >
                          {t('operations.viewDetails')}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredTransfers.length > 0 && (
          <Button variant="outline" className="w-full">
            {t('operations.loadMore')}
          </Button>
        )}
      </div>

      {/* Create Transfer Modal - Step 1: Basic Info */}
      {createStep === 'basic' && (
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader>
              <DialogTitle>{t('operations.newTransfer')}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('operations.fromWarehouse')} <span className="text-red-500">*</span>
                </label>
                <Select value={fromWarehouse} onValueChange={setFromWarehouse}>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('operations.toWarehouse')} <span className="text-red-500">*</span>
                </label>
                <Select value={toWarehouse} onValueChange={setToWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('transfers.selectDestination')} />
                  </SelectTrigger>
                  <SelectContent>
                    {mockWarehouses
                      .filter((wh) => wh.id !== fromWarehouse)
                      .map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {fromWarehouse && toWarehouse && fromWarehouse === toWarehouse && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800">{t('operations.cannotTransferSameWarehouse')}</p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={handleCloseCreate}
                className="w-full sm:w-auto"
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleNextStep}
                className="w-full sm:w-auto border-none bg-[#164945] text-white hover:bg-[#123b37]"
              >
                {t('common.next')}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Transfer Modal - Step 2: Add Products */}
      {createStep === 'products' && (
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader>
              <DialogTitle>{t('transfers.addProducts')}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {mockWarehouses.find((w) => w.id === fromWarehouse)?.name} → {mockWarehouses.find((w) => w.id === toWarehouse)?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t('transfers.searchProduct')}
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      if (!e.target.value) setSelectedProduct(null);
                    }}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera className="h-4 w-4" />
                  {t('scan.title')}
                </Button>
              </div>

              {/* Product Results */}
              {productSearch && !selectedProduct && filteredProducts.length > 0 && (
                <div className="border border-border rounded-md bg-white shadow-sm max-h-48 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setProductSearch(product.title);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="font-medium text-sm">{product.title}</div>
                      <div className="text-sm text-muted-foreground">{product.sku}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Product Input */}
              {selectedProduct && (
                <Card className="border border-border bg-muted/50 shadow-none">
                  <CardContent className="px-3 py-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{selectedProduct.title}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {selectedProduct.sku} • {t('transfers.available')}: {selectedProduct.availableStock}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(null);
                            setProductSearch('');
                            setItemQuantity('');
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">
                            {t('operations.quantity')} <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(e.target.value)}
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={handleAddProduct}
                          className="mt-6 border-none bg-[#164945] text-white hover:bg-[#123b37]"
                        >
                          {t('operations.add')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items to Transfer */}
              {transferItems.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    {t('transfers.itemsToTransfer')} ({transferItems.length})
                  </h3>
                  <div className="space-y-2">
                    {transferItems.map((item, index) => (
                      <Card key={index} className="border border-border bg-white shadow-none">
                        <CardContent className="px-3 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {t('operations.quantity')}: {item.quantity} {t('operations.units')}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(index)}
                              className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Another Product */}
              {transferItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProduct(null);
                    setProductSearch('');
                    setItemQuantity('');
                  }}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('transfers.addAnotherProduct')}
                </Button>
              )}

              {/* Total */}
              {transferItems.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t('transfers.total')}:</span>
                    <span className="font-semibold">
                      {transferItems.length} {t('transfers.products')}, {totalQuantity} {t('operations.units')}
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('operations.notes')} ({t('operations.optional')})
                </label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t('transfers.transferNotesPlaceholder')}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setCreateStep('basic')}
                className="w-full sm:w-auto"
              >
                {t('common.back')}
              </Button>
              <Button
                onClick={handleNextStep}
                className="w-full sm:w-auto border-none bg-[#164945] text-white hover:bg-[#123b37]"
              >
                {t('transfers.createTransfer')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Transfer Modal - Step 3: Confirmation */}
      {createStep === 'confirmation' && (
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader>
              <DialogTitle className="text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div className="mt-2">{t('transfers.transferCreatedSuccessfully')}</div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 text-center">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Transfer #TRF-008</p>
                <p className="text-sm text-muted-foreground">
                  {mockWarehouses.find((w) => w.id === fromWarehouse)?.name} → {mockWarehouses.find((w) => w.id === toWarehouse)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {transferItems.length} {t('operations.products')}, {totalQuantity} {t('operations.units')}
                </p>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  onClick={() => {
                    handleCloseCreate();
                    setConfirmationModalOpen(false);
                    // Navigate to transfer details
                  }}
                  className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                >
                  {t('transfers.viewTransfer')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCloseCreate();
                    setConfirmationModalOpen(false);
                    handleCreate();
                  }}
                  className="w-full"
                >
                  {t('transfers.createAnother')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCloseCreate();
                    setConfirmationModalOpen(false);
                  }}
                  className="w-full"
                >
                  {t('transfers.backToList')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Complete Transfer Modal */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>{t('transfers.completeTransfer')}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('transfers.confirmItemsReceived')}
            </DialogDescription>
          </DialogHeader>

          {selectedTransfer && (
            <div className="space-y-4">
              {/* Items List */}
              {selectedTransfer.items && selectedTransfer.items.length > 0 && (
                <div className="space-y-2">
                  {selectedTransfer.items.map((item: any, index: number) => (
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
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCompleteModalOpen(false)}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCompleteTransfer}
              className="w-full sm:w-auto border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {t('operations.complete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
