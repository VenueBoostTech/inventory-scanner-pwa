import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
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
import { useActivities, useActivitySummary, useActivity } from '@/hooks/api/useActivities';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { apiClient } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  Truck,
  ClipboardList,
  Scan,
  ShoppingCart,
  RotateCcw,
  Download,
  Filter,
  Smartphone,
  Monitor,
  Store,
  Link as LinkIcon,
  FileDown,
  Zap,
  Coffee,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Info,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

export function ActivitiesScreen() {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [displayActivity, setSelectedActivity] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // Calculate date range for API - memoized to prevent infinite loops
  const { dateFrom, dateTo } = useMemo(() => {
    const now = new Date();
    let dateFrom: string | undefined;
    let dateTo: string | undefined = now.toISOString();

    switch (dateRangeFilter) {
      case 'today':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        dateFrom = todayStart.toISOString();
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
        break;
      case 'last30':
        const last30 = new Date(now);
        last30.setDate(now.getDate() - 30);
        dateFrom = last30.toISOString();
        break;
      default:
        dateFrom = undefined;
        dateTo = undefined;
    }
    return { dateFrom, dateTo };
  }, [dateRangeFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, sourceFilter, warehouseFilter, staffFilter, dateRangeFilter]);

  // API hooks
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({
    page: currentPage,
    limit: 20,
    activityType: typeFilter !== 'all' ? typeFilter : undefined,
    dateFrom,
    dateTo,
  });

  const { data: summaryData, isLoading: summaryLoading } = useActivitySummary();
  const { data: warehouses = [] } = useWarehouses({ limit: 100 });
  const { data: activityDetails } = useActivity(
    displayActivity?.id || ''
  );

  const activities = activitiesData?.data || [];
  const pagination = activitiesData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  };
  const summary = summaryData || {
    today: 0,
    thisWeek: 0,
    mobileActivities: 0,
    byType: {
      adjustment: 0,
      order_created: 0,
      order_cancelled: 0,
      order_returned: 0,
      order_refunded: 0,
      initial_stock: 0,
      sync: 0,
    },
  };

  // Extract unique staff from activities
  const staffList = useMemo(() => {
    const staffMap = new Map();
    activities.forEach((act) => {
      if (act.staff?.id && act.staff?.name) {
        staffMap.set(act.staff.id, act.staff);
      }
    });
    return Array.from(staffMap.values());
  }, [activities]);

  const getActivityIcon = (type: string) => {
    if (!type) return Package;
    
    // Handle uppercase filter values
    switch (type.toUpperCase()) {
      case 'ADJUSTMENT':
        return Package;
      case 'TRANSFER':
        return Truck;
      case 'COUNT':
        return ClipboardList;
      case 'ORDER':
        return ShoppingCart;
      case 'RETURN':
        return RotateCcw;
      case 'SCAN':
        return Scan;
    }
    
    // Handle lowercase API values with underscores
    switch (type.toLowerCase()) {
      case 'adjustment':
        return Package;
      case 'transfer':
        return Truck;
      case 'count':
        return ClipboardList;
      case 'order_created':
      case 'order_cancelled':
      case 'order_returned':
      case 'order_refunded':
        return ShoppingCart;
      case 'initial_stock':
      case 'sync':
        return Package;
      default:
        return Package;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    if (!type) return '—';
    
    // Handle uppercase filter values
    switch (type.toUpperCase()) {
      case 'ADJUSTMENT':
        return t('operations.adjustment');
      case 'TRANSFER':
        return t('operations.transfer');
      case 'COUNT':
        return t('operations.count');
      case 'ORDER':
        return t('operations.order');
      case 'RETURN':
        return t('operations.return');
      case 'SCAN':
        return t('operations.scan');
    }
    
    // Handle lowercase API values with underscores
    switch (type.toLowerCase()) {
      case 'adjustment':
        return t('operations.adjustment');
      case 'transfer':
        return t('operations.transfer');
      case 'count':
        return t('operations.count');
      case 'order_created':
        return t('operations.orderCreated');
      case 'order_cancelled':
        return t('operations.orderCancelled');
      case 'order_returned':
        return t('operations.orderReturned');
      case 'order_refunded':
        return t('operations.orderRefunded');
      case 'initial_stock':
        return t('operations.initialStock');
      case 'sync':
        return t('operations.sync');
      default:
        return type;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'MOBILE_SCANNING':
        return Smartphone;
      case 'PANDACOMET':
        return Monitor;
      case 'ORDER':
        return Store;
      case 'WOOCOMMERCE':
        return LinkIcon;
      case 'IMPORT':
        return FileDown;
      case 'SYSTEM':
        return Zap;
      default:
        return Monitor;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'MOBILE_SCANNING':
        return t('operations.mobileApp');
      case 'PANDACOMET':
        return t('operations.adminPanel');
      case 'ORDER':
        return t('operations.orderSystem');
      case 'WOOCOMMERCE':
        return 'WooCommerce';
      case 'IMPORT':
        return t('operations.import');
      case 'SYSTEM':
        return t('operations.system');
      default:
        return source;
    }
  };

  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Source filter (client-side, API doesn't support source param)
    if (sourceFilter !== 'all') {
      filtered = filtered.filter((act) => act.source === sourceFilter);
    }

    // Warehouse filter (client-side, API doesn't support warehouse param)
    if (warehouseFilter !== 'all') {
      filtered = filtered.filter(() => {
        // Activities don't have warehouse field directly, skip for now
        return true;
      });
    }

    // Staff filter (client-side)
    if (staffFilter !== 'all') {
      filtered = filtered.filter((act) => act.staff?.id === staffFilter);
    }

    return filtered;
  }, [activities, sourceFilter, warehouseFilter, staffFilter]);

  const handleViewDetails = (activity: any) => {
    setSelectedActivity(activity);
    setDetailModalOpen(true);
  };

  // Use activity details from API if available
  const currentDisplayActivity = activityDetails || displayActivity;

  const handleExport = async () => {
    try {
      toast({
        title: t('operations.exporting'),
        description: t('operations.exportingDesc'),
      });

      // Build query parameters based on active filters
      const params: Record<string, string> = {
        format: 'csv',
      };

      // Add activity type filter
      if (typeFilter !== 'all') {
        params.activityType = typeFilter.toLowerCase();
      }

      // Add date range filters (convert ISO to YYYY-MM-DD format)
      if (dateFrom) {
        params.dateFrom = dateFrom.split('T')[0]; // Extract date part from ISO string
      }
      if (dateTo) {
        params.dateTo = dateTo.split('T')[0]; // Extract date part from ISO string
      }

      // Add warehouse filter (if we have warehouse ID mapping)
      if (warehouseFilter !== 'all') {
        const warehouse = warehouses.find((wh) => wh.name === warehouseFilter);
        if (warehouse?.id) {
          params.warehouseId = warehouse.id;
        }
      }

      // Make the export request
      const response = await apiClient.get('/activities', {
        params,
        responseType: 'blob', // Important: get binary data
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `activities-${timestamp}.csv`;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: t('operations.exportSuccess'),
        description: t('operations.exportSuccessDesc'),
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('operations.exportError'),
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setSourceFilter('all');
    setWarehouseFilter('all');
    setStaffFilter('all');
    setDateRangeFilter('all');
  };

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count++;
    if (sourceFilter !== 'all') count++;
    if (warehouseFilter !== 'all') count++;
    if (staffFilter !== 'all') count++;
    if (dateRangeFilter !== 'all') count++;
    return count;
  }, [typeFilter, sourceFilter, warehouseFilter, staffFilter, dateRangeFilter]);

  // Get active filter labels for display
  const getActiveFilterLabel = (filterType: string, value: string) => {
    switch (filterType) {
      case 'type':
        const typeLabels: Record<string, string> = {
          ADJUSTMENT: t('operations.adjustment'),
          TRANSFER: t('operations.transfer'),
          COUNT: t('operations.count'),
          ORDER: t('operations.order'),
          RETURN: t('operations.return'),
          SCAN: t('operations.scan'),
        };
        return typeLabels[value] || value;
      case 'source':
        const sourceLabels: Record<string, string> = {
          MOBILE_SCANNING: t('operations.mobileApp'),
          PANDACOMET: t('operations.adminPanel'),
          ORDER: t('operations.orderSystem'),
          IMPORT: t('operations.import'),
        };
        return sourceLabels[value] || value;
      case 'warehouse':
        return value;
      case 'staff':
        const staff = staffList.find((s) => s.id === value);
        return staff?.name || value;
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

  const SourceIcon = currentDisplayActivity ? getSourceIcon(currentDisplayActivity.source) : Monitor;

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.inventoryActivities')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Export */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{t('operations.inventoryActivities')}</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="h-10 w-10 p-0"
            title={t('operations.export')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        {/* Summary Cards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t('operations.activitySummary')}
            </h2>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {summaryLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </>
            ) : (
              <>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.today || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.today')}</div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.thisWeek || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.thisWeek')}</div>
                  </CardContent>
                </Card>
                <Card className={`border border-border bg-white shadow-none ${summaryExpanded ? 'block' : 'hidden'} sm:block`}>
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.mobileActivities || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.mobileActivities')}</div>
                  </CardContent>
                </Card>
                <Card className={`border border-border bg-white shadow-none ${summaryExpanded ? 'block' : 'hidden'} sm:block`}>
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.byType?.adjustment || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.adjustments')}</div>
                  </CardContent>
                </Card>
                <Card className={`border border-border bg-white shadow-none ${summaryExpanded ? 'block' : 'hidden'} sm:block`}>
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.byType?.order_created || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.ordersCreated')}</div>
                  </CardContent>
                </Card>
                <Card className={`border border-border bg-white shadow-none ${summaryExpanded ? 'block' : 'hidden'} sm:block`}>
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.byType?.order_cancelled || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.ordersCancelled')}</div>
                  </CardContent>
                </Card>
                <Card className={`border border-border bg-white shadow-none ${summaryExpanded ? 'block' : 'hidden'} sm:block`}>
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.byType?.order_returned || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.ordersReturned')}</div>
                  </CardContent>
                </Card>
                <Card className={`border border-border bg-white shadow-none ${summaryExpanded ? 'block' : 'hidden'} sm:block`}>
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.byType?.initial_stock || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.initialStock')}</div>
                  </CardContent>
                </Card>
              </>
            )}
            </div>
            {/* Expand/Collapse button - only visible on mobile */}
            {!summaryLoading && (
              <button
                onClick={() => setSummaryExpanded(!summaryExpanded)}
                className="sm:hidden w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {summaryExpanded ? (
                  <>
                    <span>{t('common.showLess') || 'Show Less'}</span>
                    <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <span>{t('common.showMore') || 'Show More'}</span>
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            )}
          </div>
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
            <SheetContent side="left" className="w-[300px] sm:w-[400px] flex flex-col">
              <SheetHeader className="text-left space-y-1 shrink-0">
                <SheetTitle className="text-left">{t('common.filter')}</SheetTitle>
                <SheetDescription className="text-left">{t('operations.filterActivities')}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide pr-2">
                {/* Type Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-left">{t('operations.activityType')}</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: t('operations.all') },
                      { value: 'ADJUSTMENT', label: t('operations.adjustment') },
                      { value: 'TRANSFER', label: t('operations.transfer') },
                      { value: 'COUNT', label: t('operations.count') },
                      { value: 'ORDER', label: t('operations.order') },
                      { value: 'RETURN', label: t('operations.return') },
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

                {/* Source Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-left">{t('operations.source')}</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: t('operations.all') },
                      { value: 'MOBILE_SCANNING', label: t('operations.mobileApp') },
                      { value: 'PANDACOMET', label: t('operations.adminPanel') },
                      { value: 'ORDER', label: t('operations.orderSystem') },
                      { value: 'IMPORT', label: t('operations.import') },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="source"
                          value={option.value}
                          checked={sourceFilter === option.value}
                          onChange={(e) => setSourceFilter(e.target.value)}
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
                      ...warehouses.map((wh) => ({ value: wh.name, label: wh.name })),
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

                {/* Staff Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-left">{t('operations.staff')}</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: t('operations.all') },
                      ...staffList.map((staff) => ({ value: staff.id, label: staff.name })),
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="staff"
                          value={option.value}
                          checked={staffFilter === option.value}
                          onChange={(e) => setStaffFilter(e.target.value)}
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
              <SheetFooter className="mt-4 gap-2 shrink-0 border-t border-border pt-4">
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
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {typeFilter !== 'all' && (
              <Badge variant="outline" className="gap-1">
                {t('operations.activityType')}: {getActiveFilterLabel('type', typeFilter)}
                <button
                  onClick={() => setTypeFilter('all')}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                  aria-label="Remove filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {sourceFilter !== 'all' && (
              <Badge variant="outline" className="gap-1">
                {t('operations.source')}: {getActiveFilterLabel('source', sourceFilter)}
                <button
                  onClick={() => setSourceFilter('all')}
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
            {staffFilter !== 'all' && (
              <Badge variant="outline" className="gap-1">
                {t('operations.staff')}: {getActiveFilterLabel('staff', staffFilter)}
                <button
                  onClick={() => setStaffFilter('all')}
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
        </div>

        {/* Activities Table */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">{t('operations.time')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('operations.type')}</TableHead>
                    <TableHead className="min-w-[150px]">{t('operations.product')}</TableHead>
                    <TableHead className="min-w-[80px]">{t('operations.change')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('operations.stock')}</TableHead>
                    <TableHead className="min-w-[80px]">{t('operations.source')}</TableHead>
                    <TableHead className="min-w-[80px]">{t('operations.staff')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activitiesLoading ? (
                    <>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                        {t('operations.noActivities')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivities.map((activity) => {
                      const TypeIcon = getActivityIcon(activity.activityType);
                      const SourceIconComponent = getSourceIcon(activity.source);
                      return (
                        <TableRow
                          key={activity.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewDetails(activity)}
                        >
                          <TableCell className="text-xs text-muted-foreground">
                            {activity.createdAt?.formattedDateTime || activity.createdAt?.date || '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs">{getActivityTypeLabel(activity.activityType)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {activity.product ? (
                              <div className="flex items-center gap-2">
                                {activity.product.imagePath ? (
                                  <>
                                    <img
                                      src={activity.product.imagePath}
                                      alt={activity.product.title}
                                      className="h-10 w-10 rounded object-cover shrink-0"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.classList.remove('hidden');
                                      }}
                                    />
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0 hidden">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">{activity.product.title}</div>
                                  <div className="text-xs text-muted-foreground">{activity.product.sku}</div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {activity.quantity !== 0 ? (
                              <span className={`text-sm font-semibold ${activity.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {activity.quantity > 0 ? '+' : ''}{activity.quantity}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {(activity.stockBefore != null && activity.stockAfter != null)
                              ? `${activity.stockBefore}→${activity.stockAfter}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <SourceIconComponent className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {activity.staff ? activity.staff.name.split(' ').map((n: string) => n[0]).join('.').toUpperCase() : 'Auto'}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
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
                const currentPage = pagination.page;
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

                  if (currentPage <= 3) {
                    // Near the start: 1 2 3 4 ... last
                    for (let i = 2; i <= 4; i++) {
                      pages.push(i);
                    }
                    pages.push('ellipsis');
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    // Near the end: 1 ... (last-3) (last-2) (last-1) last
                    pages.push('ellipsis');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // In the middle: 1 ... (current-1) current (current+1) ... last
                    pages.push('ellipsis');
                    pages.push(currentPage - 1);
                    pages.push(currentPage);
                    pages.push(currentPage + 1);
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
                            currentPage === item
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

        {/* Info Section */}
        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-3 px-3 pt-3 pb-2">
            <div className="flex items-start gap-3 flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945]/10">
                <Info className="h-5 w-5 text-[#164945]" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-md font-semibold text-foreground">{t('operations.activitiesInfoTitle')}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {t('operations.activitiesInfoDesc')}
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
                    <SheetTitle className="text-left">{t('operations.activitiesGuide')}</SheetTitle>
                    <SheetDescription className="text-left">
                      {t('operations.activitiesGuideDesc')}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    {/* Mobile Activities */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">{t('operations.whatAreMobileActivities')}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>{t('operations.mobileActivitiesDesc1')}</p>
                        <p>{t('operations.mobileActivitiesDesc2')}</p>
                        <p>{t('operations.mobileActivitiesDesc3')}</p>
                      </div>
                    </div>

                    {/* Scans vs Activities */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <h3 className="text-sm font-semibold text-foreground">
                          {t('operations.scansVsActivities')}
                        </h3>
                      </div>
                      <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {t('operations.scanLogOnly')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('operations.scanLogOnlyDesc')}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {t('operations.whenActivitiesCreated')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('operations.whenActivitiesCreatedDesc')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Example */}
                    <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-semibold text-foreground">{t('operations.example')}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('operations.exampleDesc')}
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

      {/* Activity Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>{t('operations.activityDetails')}</DialogTitle>
          </DialogHeader>

          {currentDisplayActivity && (
            <div className="space-y-4">
              {/* Type and ID */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = getActivityIcon(currentDisplayActivity.activityType);
                    return <Icon className="h-5 w-5 text-muted-foreground" />;
                  })()}
                  <span className="text-sm font-semibold">
                    {getActivityTypeLabel(currentDisplayActivity.activityType)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">ID: {currentDisplayActivity.id?.slice(0, 8) || currentDisplayActivity.id || '—'}</span>
              </div>

              {/* Product */}
              {currentDisplayActivity.product && (
                <Card className="border border-border bg-muted/50 shadow-none">
                  <CardContent className="px-3 py-3">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">{t('operations.product')}</h3>
                      <div className="flex items-start gap-3">
                        {currentDisplayActivity.product.imagePath ? (
                          <>
                            <img
                              src={currentDisplayActivity.product.imagePath}
                              alt={currentDisplayActivity.product.title}
                              className="h-16 w-16 rounded object-cover shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.classList.remove('hidden');
                              }}
                            />
                            <div className="h-16 w-16 rounded bg-muted flex items-center justify-center shrink-0 hidden">
                              <Coffee className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </>
                        ) : (
                          <div className="h-16 w-16 rounded bg-muted flex items-center justify-center shrink-0">
                            <Coffee className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{currentDisplayActivity.product?.title || '—'}</p>
                          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                            <div>
                              <span className="font-medium">SKU:</span> {currentDisplayActivity.product?.sku || '—'}
                            </div>
                            {currentDisplayActivity.product?.barcode && (
                              <div>
                                <span className="font-medium">{t('operations.barcode')}:</span> {currentDisplayActivity.product.barcode}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {currentDisplayActivity.product.id && (
                        <div className="pt-2 border-t border-border">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 text-xs w-full sm:w-auto"
                            onClick={() => {
                              navigate(`/products/${currentDisplayActivity.product.id}`);
                              setDetailModalOpen(false);
                            }}
                          >
                            {t('common.view')}
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stock Change */}
              {(currentDisplayActivity.stockBefore != null && currentDisplayActivity.stockAfter != null) && (
                <Card className="border border-border bg-muted/50 shadow-none">
                  <CardContent className="px-3 py-3">
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">{t('operations.stockChange')}</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('operations.before')}</p>
                          <p className="font-medium">{currentDisplayActivity.stockBefore ?? '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('operations.after')}</p>
                          <p className="font-medium">{currentDisplayActivity.stockAfter ?? '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('operations.change')}</p>
                          <p className={`font-semibold ${(currentDisplayActivity.quantity ?? 0) > 0 ? 'text-emerald-600' : (currentDisplayActivity.quantity ?? 0) < 0 ? 'text-red-600' : ''}`}>
                            {(currentDisplayActivity.quantity ?? 0) > 0 ? '+' : ''}{currentDisplayActivity.quantity ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Details */}
              <Card className="border border-border bg-muted/50 shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">{t('operations.details')}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t('operations.source')}</span>
                        <div className="flex items-center gap-1">
                          <SourceIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{getSourceLabel(currentDisplayActivity.source)} ({currentDisplayActivity.source})</span>
                        </div>
                      </div>
                      {currentDisplayActivity.reason && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t('operations.reason')}</span>
                          <span className="font-medium">{currentDisplayActivity.reason}</span>
                        </div>
                      )}
                      {currentDisplayActivity.notes && (
                        <div className="flex items-start justify-between pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground">{t('operations.notes')}</span>
                          <span className="text-right flex-1 ml-4">{currentDisplayActivity.notes}</span>
                        </div>
                      )}
                      {currentDisplayActivity.warehouse && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t('operations.warehouse')}</span>
                          <span className="font-medium">{currentDisplayActivity.warehouse.name}</span>
                        </div>
                      )}
                      {currentDisplayActivity.reference && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t('operations.reference')}</span>
                          <span className="font-medium">
                            {currentDisplayActivity.reference.type 
                              ? getActivityTypeLabel(currentDisplayActivity.reference.type.toUpperCase())
                              : currentDisplayActivity.reference.type || '—'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performed By */}
              <Card className="border border-border bg-muted/50 shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">{t('operations.performedBy')}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t('operations.createdBy')}</span>
                        <span className="font-medium">
                          {(() => {
                            if (currentDisplayActivity.staff?.name) {
                              return `${currentDisplayActivity.staff.name}${currentDisplayActivity.staff.email ? ` (${currentDisplayActivity.staff.email})` : ''}`;
                            }
                            if (currentDisplayActivity.createdBy?.name) {
                              return currentDisplayActivity.createdBy.name;
                            }
                            return t('operations.system');
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t('operations.dateTime')}</span>
                        <span className="font-medium">
                          {currentDisplayActivity.createdAt?.formattedDateTime || currentDisplayActivity.createdAt?.date || '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailModalOpen(false)}
              className="w-full sm:w-auto"
            >
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
