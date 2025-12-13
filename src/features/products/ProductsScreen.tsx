import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { useProducts } from '@/hooks/api/useProducts';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types/api';

type QuickFilter = 'all' | 'low_stock' | 'out_of_stock' | 'no_barcode';
type SortOption = 'stock_low_high' | 'stock_high_low' | 'name_az' | 'name_za' | 'recent';


export function ProductsScreen() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('stock_low_high');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [barcodeStatusFilter, setBarcodeStatusFilter] = useState<string>('all');

  // Build API params
  const apiParams = useMemo(() => {
    const params: any = {
      search: search || undefined,
      limit: 100, // Adjust as needed
    };
    if (stockStatusFilter !== 'all') {
      params.stockStatus = stockStatusFilter;
    }
    if (categoryFilter !== 'all') {
      params.categoryId = categoryFilter;
    }
    if (barcodeStatusFilter === 'has_barcode') {
      params.hasBarcode = true;
    } else if (barcodeStatusFilter === 'no_barcode') {
      params.hasBarcode = false;
    }
    return params;
  }, [search, stockStatusFilter, categoryFilter, barcodeStatusFilter]);

  const { data: products = [], isLoading } = useProducts(apiParams);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...(products || [])];

    // Apply quick filter (client-side for better UX with tabs)
    if (quickFilter === 'low_stock') {
      filtered = filtered.filter((p) => p.stockStatus === 'low_stock');
    } else if (quickFilter === 'out_of_stock') {
      filtered = filtered.filter((p) => p.stockStatus === 'out_of_stock');
    } else if (quickFilter === 'no_barcode') {
      filtered = filtered.filter((p) => !p.hasBarcode);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stock_low_high':
          return a.stockQuantity - b.stockQuantity;
        case 'stock_high_low':
          return b.stockQuantity - a.stockQuantity;
        case 'name_az':
          return a.title.localeCompare(b.title);
        case 'name_za':
          return b.title.localeCompare(a.title);
        case 'recent':
          return 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, quickFilter, sortBy]);

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
    setBarcodeStatusFilter('all');
    setQuickFilter('all');
  };

  const categories = Array.from(new Set(products.map((p) => p.category?.name).filter(Boolean)));

  const counts = {
    all: products.length,
    low_stock: products.filter((p) => p.stockStatus === 'low_stock').length,
    out_of_stock: products.filter((p) => p.stockStatus === 'out_of_stock').length,
    no_barcode: products.filter((p) => !p.hasBarcode).length,
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
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {t('common.filter')}
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
                        <SelectItem key={cat || 'unknown'} value={cat || 'unknown'}>
                          {cat || '—'}
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

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t('common.sort')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stock_low_high">{t('products.sortLowHigh')}</SelectItem>
              <SelectItem value="stock_high_low">{t('products.sortHighLow')}</SelectItem>
              <SelectItem value="name_az">{t('products.sortNameAZ')}</SelectItem>
              <SelectItem value="name_za">{t('products.sortNameZA')}</SelectItem>
              <SelectItem value="recent">{t('products.sortRecent')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
          ) : filteredAndSortedProducts.length === 0 ? (
            <Card className="border border-border bg-white shadow-none">
              <CardContent className="px-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">{t('products.noProducts')}</p>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedProducts.map((product) => (
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
      </div>
    </div>
  );
}
