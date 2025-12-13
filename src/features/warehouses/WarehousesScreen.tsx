import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useI18n } from '@/lib/i18n';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { Warehouse, Search as SearchIcon, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Info, ArrowRight, Lightbulb, AlertCircle } from 'lucide-react';

export function WarehousesScreen() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [infoOpen, setInfoOpen] = useState(false);

  // API hook with pagination and search
  const { data: warehousesData, isLoading } = useWarehouses({
    page: currentPage,
    limit: 20,
    search: search || undefined,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const warehouses = warehousesData?.data || [];
  const pagination = warehousesData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };

  const formatAddress = (warehouse: any) => {
    if (!warehouse.addressDetails) return warehouse.address || '—';
    const addr = warehouse.addressDetails;
    const parts = [
      addr.addressLine1,
      addr.addressLine2,
      addr.city,
      addr.state,
      addr.postalCode,
      addr.country,
    ].filter(Boolean);
    return parts.join(', ') || '—';
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {t('common.active')}
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-50 text-gray-700 border-gray-200">
        <XCircle className="h-3 w-3 mr-1" />
        {t('common.inactive')}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.warehouses')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t('operations.warehouses')}</h1>
          <p className="text-sm text-muted-foreground">{t('operations.warehousesSubtitle')}</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('auth.warehouses.searchByName') || 'Search by name...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Warehouses List */}
        <div className="space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-border bg-white shadow-none">
                  <CardContent className="px-3 py-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : warehouses.length === 0 ? (
            <Card className="border border-border bg-white shadow-none">
              <CardContent className="px-3 py-8 text-center">
                <p className="text-sm text-muted-foreground">{t('operations.noWarehouses')}</p>
              </CardContent>
            </Card>
          ) : (
            warehouses.map((warehouse) => (
              <Card key={warehouse.id} className="border border-border bg-white shadow-none">
                <CardContent className="px-3 py-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945]/10">
                        <Warehouse className="h-5 w-5 text-[#164945]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-foreground">{warehouse.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{warehouse.code}</p>
                          </div>
                          {getStatusBadge(warehouse.isActive)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatAddress(warehouse)}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    {warehouse.stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-muted-foreground">{t('products.totalProducts')}</p>
                          <p className="text-sm font-semibold text-foreground">{warehouse.stats.totalProducts || 0}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-muted-foreground">{t('operations.totalStock')}</p>
                          <p className="text-sm font-semibold text-foreground">{warehouse.stats.totalStock || 0}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-muted-foreground">{t('products.inStock')}</p>
                          <p className="text-sm font-semibold text-emerald-600">{warehouse.stats.inStockProducts || 0}</p>
                        </div>
                        {warehouse.stats.lowStockProducts > 0 && (
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground">{t('products.lowStockStatus')}</p>
                            <p className="text-sm font-semibold text-yellow-600">{warehouse.stats.lowStockProducts}</p>
                          </div>
                        )}
                        {warehouse.stats.outOfStockProducts > 0 && (
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground">{t('products.outOfStock')}</p>
                            <p className="text-sm font-semibold text-red-600">{warehouse.stats.outOfStockProducts}</p>
                          </div>
                        )}
                        {warehouse.stats.missingBarcode > 0 && (
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-muted-foreground">{t('products.missingBarcode')}</p>
                            <p className="text-sm font-semibold text-amber-600">{warehouse.stats.missingBarcode}</p>
                          </div>
                        )}
                      </div>
                    )}
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
                  // Show all pages if 7 or fewer
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Always show first page
                  pages.push(1);

                  if (currentPageNum <= 3) {
                    // Near the start: 1 2 3 4 ... last
                    for (let i = 2; i <= 4; i++) {
                      pages.push(i);
                    }
                    pages.push('ellipsis');
                    pages.push(totalPages);
                  } else if (currentPageNum >= totalPages - 2) {
                    // Near the end: 1 ... (last-3) (last-2) (last-1) last
                    pages.push('ellipsis');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // In the middle: 1 ... (current-1) current (current+1) ... last
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

        {/* Info Section */}
        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-3 px-3 pt-3 pb-2">
            <div className="flex items-start gap-3 flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945]/10">
                <Info className="h-5 w-5 text-[#164945]" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-md font-semibold text-foreground">{t('operations.warehousesInfoTitle')}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {t('operations.warehousesInfoDesc')}
                </CardDescription>
              </div>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto flex justify-end sm:justify-start">
              <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm font-medium text-[#164945] hover:underline cursor-pointer"
                  >
                    {t('common.learnMore')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[75%] sm:w-[400px]">
                  <SheetHeader className="text-left space-y-1">
                    <SheetTitle className="text-left">{t('operations.warehousesGuide')}</SheetTitle>
                    <SheetDescription className="text-left">
                      {t('operations.warehousesGuideDesc')}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* The Difference */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">{t('operations.warehousesDifference')}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{t('operations.productList')}</p>
                          <p className="text-xs">{t('operations.productListDesc')}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{t('operations.warehouseStats')}</p>
                          <p className="text-xs">{t('operations.warehouseStatsDesc')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Why Numbers Differ */}
                    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <h3 className="text-sm font-semibold text-foreground">
                          {t('operations.whyNumbersDiffer')}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('operations.whyNumbersDifferDesc')}
                      </p>
                    </div>

                    {/* When Products Appear */}
                    <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-semibold text-foreground">{t('operations.whenProductsAppear')}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('operations.whenProductsAppearDesc')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={() => setInfoOpen(false)}
                      className="w-full border-none bg-[#164945] text-white hover:bg-[#123b37]"
                    >
                      {t('common.gotIt')}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
