import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Info, Search as SearchIcon, ChevronLeft, ChevronRight, Package, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { authStore } from '@/stores/authStore';

export function MyWarehousesScreen() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const profile = authStore((state) => state.profile);
  const warehouseIds = profile?.permissions?.warehouseIds || [];
  
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

  // Filter warehouses based on user's access
  const accessibleWarehouses = useMemo(() => {
    return warehouses.filter((wh) => 
      warehouseIds.length === 0 || warehouseIds.includes(wh.id)
    );
  }, [warehouses, warehouseIds]);

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
      <ScreenHeader title={t('auth.warehouses.title')} showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">{t('auth.warehouses.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('auth.warehouses.subtitle')}</p>
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

        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">{t('auth.warehouses.warehousesICanAccess')}</h3>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-white p-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))
              ) : accessibleWarehouses.length > 0 ? (
                accessibleWarehouses.map((warehouse) => (
                  <div key={warehouse.id} className="rounded-lg border border-border bg-white p-3 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945]/10">
                        <MapPin className="h-5 w-5 text-[#164945]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">{warehouse.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {warehouse.code}
                            </p>
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('auth.warehouses.noWarehouses')}</p>
              )}
            </div>
          </CardContent>
        </Card>

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

        <Card className="border border-blue-200 bg-blue-50/50 shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 shrink-0 text-blue-600" />
              <p className="text-xs text-blue-900">
                {t('auth.warehouses.contactAdmin')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
