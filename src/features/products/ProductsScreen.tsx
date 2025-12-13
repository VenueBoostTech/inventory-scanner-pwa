import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
} from 'lucide-react';
import { useProducts } from '@/hooks/api/useProducts';
import { useCategories } from '@/hooks/api/useProductMeta';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types/api';

type QuickFilter = 'all' | 'low_stock' | 'out_of_stock' | 'no_barcode';

export function ProductsScreen() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [barcodeStatusFilter, setBarcodeStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Get categories and warehouses for filters
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];
  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const warehouses = warehousesData?.data || [];

  // Determine categoryId and warehouseId for API
  const categoryId = useMemo(() => {
    if (categoryFilter === 'all') return undefined;
    const selectedCategory = categories.find((cat) => cat.id === categoryFilter || cat.name === categoryFilter);
    return selectedCategory?.id;
  }, [categoryFilter, categories]);

  const warehouseId = useMemo(() => {
    if (warehouseFilter === 'all') return undefined;
    const selectedWarehouse = warehouses.find((wh) => wh.id === warehouseFilter || wh.name === warehouseFilter);
    return selectedWarehouse?.id;
  }, [warehouseFilter, warehouses]);

  // Build API params
  const apiParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: 20,
      search: search || undefined,
      sortBy,
      sortOrder,
    };
    
    // Apply quick filter as stockStatus
    if (quickFilter === 'low_stock') {
      params.stockStatus = 'low_stock';
    } else if (quickFilter === 'out_of_stock') {
      params.stockStatus = 'out_of_stock';
    } else if (stockStatusFilter !== 'all') {
      params.stockStatus = stockStatusFilter;
    }
    
    if (categoryId) {
      params.categoryId = categoryId;
    }
    
    if (warehouseId) {
      params.warehouseId = warehouseId;
    }
    
    if (barcodeStatusFilter === 'has_barcode') {
      params.hasBarcode = true;
    } else if (barcodeStatusFilter === 'no_barcode') {
      params.hasBarcode = false;
    }
    
    return params;
  }, [search, quickFilter, stockStatusFilter, categoryId, warehouseId, barcodeStatusFilter, sortBy, sortOrder, currentPage]);

  const { data: productsData, isLoading } = useProducts(apiParams);
  const products = productsData?.data || [];
  const pagination = productsData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, quickFilter, stockStatusFilter, categoryFilter, warehouseFilter, barcodeStatusFilter, sortBy, sortOrder]);

  // Apply client-side quick filter for counts (since we need all products for counts)
  const allProductsForCounts = products; // We'll use server-side counts if available, otherwise client-side
  const counts = {
    all: pagination.total || allProductsForCounts.length,
    low_stock: quickFilter === 'low_stock' ? products.length : 0, // Approximate
    out_of_stock: quickFilter === 'out_of_stock' ? products.length : 0, // Approximate
    no_barcode: quickFilter === 'no_barcode' ? products.length : 0, // Approximate
  };

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (stockStatusFilter !== 'all' && quickFilter === 'all') count++;
    if (categoryFilter !== 'all') count++;
    if (warehouseFilter !== 'all') count++;
    if (barcodeStatusFilter !== 'all') count++;
    return count;
  }, [stockStatusFilter, categoryFilter, warehouseFilter, barcodeStatusFilter, quickFilter]);

  // Get active filter labels for display
  const getActiveFilterLabel = (filterType: string, value: string) => {
    switch (filterType) {
      case 'category':
        const category = categories.find((cat) => cat.id === value || cat.name === value);
        return category?.name || value;
      case 'warehouse':
        const warehouse = warehouses.find((wh) => wh.id === value || wh.name === value);
        return warehouse?.name || value;
      case 'stockStatus':
        const statusLabels: Record<string, string> = {
          in_stock: t('products.inStock'),
          low_stock: t('products.lowStockStatus'),
          out_of_stock: t('products.outOfStock'),
        };
        return statusLabels[value] || value;
      default:
        return value;
    }
  };

  const getStockStatusBadge = (status: string, _quantity: number) => {
    if (status === 'in_stock') {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {t('products.inStock')}
        </Badge>
      );
    }
    if (status === 'low_stock') {
      return (
        <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {t('products.lowStockStatus')}
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-50 text-red-700 border-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        {t('products.outOfStock')}
      </Badge>
    );
  };

  const ProductImage = ({ imagePath, title }: { imagePath: string | null; title: string }) => {
    const [hasError, setHasError] = useState(false);
    const showPlaceholder = !imagePath || !imagePath.trim() || hasError;

    if (showPlaceholder) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/80 via-muted/60 to-muted/40">
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="rounded-lg bg-muted-foreground/10 p-2">
              <Package className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div className="h-0.5 w-10 rounded-full bg-muted-foreground/15" />
          </div>
        </div>
      );
    }

    return (
      <img
        src={imagePath}
        alt={title}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
      />
    );
  };

  const getBarcodeStatus = (hasBarcode: boolean) => {
    if (!hasBarcode) {
      return (
        <div className="flex items-center gap-1 text-xs text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          {t('products.noBarcode')}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-xs text-emerald-600">
        <Package className="h-3 w-3" />
        {t('products.hasBarcode')}
      </div>
    );
  };

  const getProductDisplayName = (product: Product) => {
    return language === 'sq' && product.titleAl ? product.titleAl : product.title;
  };

  const clearFilters = () => {
    setStockStatusFilter('all');
    setCategoryFilter('all');
    setWarehouseFilter('all');
    setBarcodeStatusFilter('all');
    setQuickFilter('all');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('products.title')} />
      <div className="space-y-4 px-4 py-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('products.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Quick Filter Tabs */}
        <div className="overflow-x-auto scrollbar-hide w-full">
          <Tabs value={quickFilter} onValueChange={(v) => setQuickFilter(v as QuickFilter)}>
            <TabsList className="inline-flex w-auto min-w-full sm:w-full sm:min-w-0">
              <TabsTrigger value="all" className="text-sm whitespace-nowrap shrink-0">
                {t('products.all')} ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="low_stock" className="text-sm whitespace-nowrap shrink-0">
                {t('products.lowStock')} ({counts.low_stock})
              </TabsTrigger>
              <TabsTrigger value="out_of_stock" className="text-sm whitespace-nowrap shrink-0">
                {t('products.outStock')} ({counts.out_of_stock})
              </TabsTrigger>
              <TabsTrigger value="no_barcode" className="text-sm whitespace-nowrap shrink-0">
                {t('products.noBarcode')} ({counts.no_barcode})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filters and Sort Bar */}
        <div className="flex items-center justify-between gap-2">
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 relative">
                <Filter className="h-4 w-4" />
                {t('common.filter')}
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#164945] text-white text-[10px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader className="text-left space-y-1">
                <SheetTitle className="text-left">{t('common.filter')}</SheetTitle>
                <SheetDescription className="text-left">{t('products.filterProducts')}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Stock Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-left">{t('products.stockStatus')}</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: t('products.allStatus') },
                      { value: 'in_stock', label: t('products.inStock') },
                      { value: 'low_stock', label: t('products.lowStockStatus') },
                      { value: 'out_of_stock', label: t('products.outOfStock') },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="stockStatus"
                          value={option.value}
                          checked={stockStatusFilter === option.value}
                          onChange={(e) => setStockStatusFilter(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-left">{t('products.category')}</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('products.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('products.allCategories')}</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Warehouse Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-left">{t('operations.warehouse')}</label>
                  <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('operations.selectWarehouse')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('operations.allWarehouses')}</SelectItem>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Barcode Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-left">{t('products.barcodeStatus')}</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: t('products.allStatus') },
                      { value: 'has_barcode', label: t('products.hasBarcode') },
                      { value: 'no_barcode', label: t('products.missingBarcode') },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="barcodeStatus"
                          value={option.value}
                          checked={barcodeStatusFilter === option.value}
                          onChange={(e) => setBarcodeStatusFilter(e.target.value)}
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

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('common.sort')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">{t('products.sortName')}</SelectItem>
                <SelectItem value="stockQuantity">{t('products.sortStock')}</SelectItem>
                <SelectItem value="productSku">{t('products.sortSku')}</SelectItem>
                <SelectItem value="createdAt">{t('products.sortCreated')}</SelectItem>
                <SelectItem value="updatedAt">{t('products.sortUpdated')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">{t('common.asc')}</SelectItem>
                <SelectItem value="desc">{t('common.desc')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {stockStatusFilter !== 'all' && quickFilter === 'all' && (
              <Badge variant="outline" className="gap-1">
                {t('products.stockStatus')}: {getActiveFilterLabel('stockStatus', stockStatusFilter)}
                <button
                  onClick={() => setStockStatusFilter('all')}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                  aria-label="Remove filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {categoryFilter !== 'all' && (
              <Badge variant="outline" className="gap-1">
                {t('products.category')}: {getActiveFilterLabel('category', categoryFilter)}
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                  aria-label="Remove filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {warehouseFilter !== 'all' && (
              <Badge variant="outline" className="gap-1">
                {t('operations.warehouse')}: {getActiveFilterLabel('warehouse', warehouseFilter)}
                <button
                  onClick={() => setWarehouseFilter('all')}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                  aria-label="Remove filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {barcodeStatusFilter !== 'all' && (
              <Badge variant="outline" className="gap-1">
                {t('products.barcodeStatus')}: {barcodeStatusFilter === 'has_barcode' ? t('products.hasBarcode') : t('products.missingBarcode')}
                <button
                  onClick={() => setBarcodeStatusFilter('all')}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                  aria-label="Remove filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {activeFiltersCount > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
              >
                {t('products.clearFilters')}
              </Button>
            )}
          </div>
        )}

        {/* Products List */}
        <div className="space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="border border-border bg-white shadow-none">
                  <CardContent className="px-3 py-3">
                    <div className="flex gap-3">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : products.length === 0 ? (
            <Card className="border border-border bg-white shadow-none">
              <CardContent className="px-3 py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">{t('products.noProducts')}</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      {t('products.noProductsDesc')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            products.map((product) => (
              <Card
                key={product.id}
                className="border border-border bg-white shadow-none cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <CardContent className="px-3 py-3">
                  <div className="flex gap-3">
                    {/* Product Image */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
                      <ProductImage imagePath={product.imagePath} title={getProductDisplayName(product)} />
                    </div>

                    {/* Product Info */}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{getProductDisplayName(product)}</h3>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {getBarcodeStatus(product.hasBarcode)}
                        <div className="text-xs text-muted-foreground">
                          {t('products.stock')} <span className="font-semibold text-foreground">{product.stockQuantity}</span>
                        </div>
                        {getStockStatusBadge(product.stockStatus, product.stockQuantity)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <span className="text-center sm:text-left text-xs sm:text-sm">
              {t('operations.showing')} {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} {t('operations.of')} {pagination.total.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              {/* Previous button */}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="h-8 w-8 p-0"
                aria-label={t('operations.prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers with ellipsis */}
              {(() => {
                const currentPageNum = pagination.page;
                const totalPages = pagination.totalPages;
                const pages: (number | 'ellipsis')[] = [];

                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  pages.push(1);
                  if (currentPageNum <= 3) {
                    for (let i = 2; i <= 4; i++) {
                      pages.push(i);
                    }
                    pages.push('ellipsis');
                    pages.push(totalPages);
                  } else if (currentPageNum >= totalPages - 2) {
                    pages.push('ellipsis');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push('ellipsis');
                    pages.push(currentPageNum - 1);
                    pages.push(currentPageNum);
                    pages.push(currentPageNum + 1);
                    pages.push('ellipsis');
                    pages.push(totalPages);
                  }
                }

                return (
                  <div className="flex items-center gap-1">
                    {pages.map((item, index) => {
                      if (item === 'ellipsis') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                            ...
                          </span>
                        );
                      }
                      return (
                        <Button
                          key={item}
                          variant="outline"
                          size="sm"
                          className={`h-8 w-8 p-0 text-xs sm:text-sm ${
                            currentPageNum === item
                              ? 'bg-[#164945] text-white hover:bg-[#123b37]'
                              : ''
                          }`}
                          onClick={() => setCurrentPage(item)}
                        >
                          {item}
                        </Button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Next button */}
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="h-8 w-8 p-0"
                aria-label={t('operations.next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Informative Sections */}
        <div className="space-y-3">
          {/* Adding Products Section */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945]/10">
                  <Info className="h-5 w-5 text-[#164945]" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">{t('products.addingProducts')}</h3>
                  <p className="text-sm text-muted-foreground">{t('products.addingProductsDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deleting Products Section */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">{t('products.deletingProducts')}</h3>
                  <p className="text-sm text-muted-foreground">{t('products.deletingProductsDesc')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
