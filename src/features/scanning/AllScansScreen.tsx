import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { useScanHistory } from '@/hooks/api/useScanHistory';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { authStore } from '@/stores/authStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CheckCircle2, XCircle, Plus, AlertCircle, Search as SearchIcon, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const getDateRange = (filter: string) => {
  const now = new Date();
  let dateFrom: string | undefined;
  let dateTo: string | undefined;

  switch (filter) {
    case 'today':
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      dateFrom = todayStart.toISOString().split('T')[0];
      dateTo = now.toISOString().split('T')[0];
      break;
    case 'yesterday':
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      dateFrom = yesterday.toISOString().split('T')[0];
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      dateTo = yesterdayEnd.toISOString().split('T')[0];
      break;
    case 'last7':
      const last7 = new Date(now);
      last7.setDate(now.getDate() - 7);
      dateFrom = last7.toISOString().split('T')[0];
      dateTo = now.toISOString().split('T')[0];
      break;
    case 'last30':
      const last30 = new Date(now);
      last30.setDate(now.getDate() - 30);
      dateFrom = last30.toISOString().split('T')[0];
      dateTo = now.toISOString().split('T')[0];
      break;
    default:
      dateFrom = undefined;
      dateTo = undefined;
  }
  return { dateFrom, dateTo };
};

export function AllScansScreen() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const profile = authStore((state) => state.profile);
  const defaultWarehouseId = profile?.permissions?.warehouseIds?.[0];

  // Get warehouses for filter
  const { data: warehouses = [] } = useWarehouses({ limit: 100 });

  // Calculate date range for API - memoized to prevent infinite loops
  const { dateFrom, dateTo } = useMemo(() => getDateRange(dateRangeFilter), [dateRangeFilter]);

  // Determine warehouseId to use
  const warehouseId = useMemo(() => {
    if (warehouseFilter === 'all') {
      return defaultWarehouseId;
    }
    const selectedWarehouse = warehouses.find((wh) => wh.id === warehouseFilter || wh.name === warehouseFilter);
    return selectedWarehouse?.id || defaultWarehouseId;
  }, [warehouseFilter, warehouses, defaultWarehouseId]);

  const { data: scanHistoryData, isLoading } = useScanHistory({
    page: currentPage,
    limit: 20,
    warehouseId,
    search: search || undefined,
    dateFrom,
    dateTo,
  });

  const scans = scanHistoryData?.data || [];
  const pagination = scanHistoryData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, warehouseFilter, dateRangeFilter]);

  const clearFilters = () => {
    setWarehouseFilter('all');
    setDateRangeFilter('all');
  };

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (warehouseFilter !== 'all') count++;
    if (dateRangeFilter !== 'all') count++;
    return count;
  }, [warehouseFilter, dateRangeFilter]);

  // Get active filter labels for display
  const getActiveFilterLabel = (filterType: string, value: string) => {
    switch (filterType) {
      case 'warehouse':
        return value;
      case 'dateRange':
        const dateLabels: Record<string, string> = {
          today: t('operations.today'),
          yesterday: t('operations.yesterday'),
          last7: t('operations.last7Days'),
          last30: t('operations.last30Days'),
        };
        return dateLabels[value] || value;
      default:
        return value;
    }
  };

  const getStatusIcon = (result: string) => {
    switch (result) {
      case 'found':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'not_found':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'created':
        return <Plus className="h-4 w-4 text-blue-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    }
  };

  const getStatusLabel = (result: string) => {
    switch (result) {
      case 'found':
        return t('scan.found');
      case 'not_found':
        return t('scan.notFound');
      case 'created':
        return t('scan.created');
      case 'error':
        return t('common.error');
      default:
        return t('scan.found');
    }
  };


  // Search is now handled server-side via API

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('scan.recentScans')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t('scan.recentScans')}</h1>
          <p className="text-sm text-muted-foreground">{t('scan.latestLookups')}</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-2">
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
                  <SheetDescription className="text-left">{t('operations.filterActivities')}</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {/* Warehouse Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-left">{t('operations.warehouse')}</label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: t('operations.all') },
                        ...warehouses.map((wh) => ({ value: wh.id, label: wh.name })),
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

                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-left">{t('operations.dateRange')}</label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: t('operations.all') },
                        { value: 'today', label: t('operations.today') },
                        { value: 'yesterday', label: t('operations.yesterday') },
                        { value: 'last7', label: t('operations.last7Days') },
                        { value: 'last30', label: t('operations.last30Days') },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="dateRange"
                            value={option.value}
                            checked={dateRangeFilter === option.value}
                            onChange={(e) => setDateRangeFilter(e.target.value)}
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
          </div>

          {/* Active Filter Tags */}
          {(warehouseFilter !== 'all' || dateRangeFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2">
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
              {dateRangeFilter !== 'all' && (
                <Badge variant="outline" className="gap-1">
                  {t('operations.dateRange')}: {getActiveFilterLabel('dateRange', dateRangeFilter)}
                  <button
                    onClick={() => setDateRangeFilter('all')}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                    aria-label="Remove filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
              >
                {t('products.clearFilters')}
              </Button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('scan.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Scans Table */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {isLoading ? (
                <div className="space-y-3 p-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : scans.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">{t('scan.product')}</TableHead>
                      <TableHead className="min-w-[120px]">SKU</TableHead>
                      <TableHead className="min-w-[120px]">{t('scan.barcode')}</TableHead>
                      <TableHead className="min-w-[120px]">{t('scan.status')}</TableHead>
                      <TableHead className="min-w-[180px] text-right">{t('scan.time')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell className="text-sm font-semibold text-foreground min-w-[200px] py-2.5">
                          {scan.product?.title ?? 'Unknown Product'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground min-w-[120px] py-2.5">
                          {scan.product?.sku || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground min-w-[120px] py-2.5">
                          {scan.barcode || '-'}
                        </TableCell>
                        <TableCell className="min-w-[120px] py-2.5">
                          <div className="flex items-center gap-1.5">
                            {getStatusIcon(scan.result)}
                            <span className="text-sm font-medium text-foreground">
                              {getStatusLabel(scan.result)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground min-w-[180px] py-2.5">
                          {scan.scannedAt?.formattedDateTime || scan.scannedAt?.date || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              {/* Previous button with arrow */}
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

              {/* Next button with arrow */}
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
      </div>
    </div>
  );
}

