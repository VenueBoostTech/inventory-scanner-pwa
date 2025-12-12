import { useState, useMemo } from 'react';
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
import { useActivities, useActivitySummary, useActivity } from '@/hooks/api/useActivities';
import { useWarehouses } from '@/hooks/api/useWarehouses';
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
  Search,
  Smartphone,
  Monitor,
  Store,
  Link as LinkIcon,
  FileDown,
  Zap,
  Coffee,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

export function ActivitiesScreen() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [displayActivity, setSelectedActivity] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>('today');

  // Calculate date range for API
  const getDateRange = (range: string) => {
    const now = new Date();
    let dateFrom: string | undefined;
    let dateTo: string | undefined = now.toISOString();

    switch (range) {
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
  };

  const { dateFrom, dateTo } = getDateRange(dateRangeFilter);

  // API hooks
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities({
    page: 1,
    limit: 100,
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
  const summary = summaryData || {
    today: 0,
    thisWeek: 0,
    mobileActivities: 0,
    byType: {
      adjustment: 0,
      order_created: 0,
      order_cancelled: 0,
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
    switch (type) {
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
      default:
        return Package;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
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

    // Client-side search filter (API doesn't support search param for activities)
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (act) =>
          act.id.toLowerCase().includes(searchLower) ||
          (act.product?.title?.toLowerCase().includes(searchLower)) ||
          (act.product?.sku?.toLowerCase().includes(searchLower)) ||
          (act.staff?.name?.toLowerCase().includes(searchLower)) ||
          (act.notes?.toLowerCase().includes(searchLower))
      );
    }

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
  }, [activities, search, sourceFilter, warehouseFilter, staffFilter]);

  const handleViewDetails = (activity: any) => {
    setSelectedActivity(activity);
    setDetailModalOpen(true);
  };

  // Use activity details from API if available
  const currentDisplayActivity = activityDetails || displayActivity;

  const handleExport = () => {
    toast({
      title: t('operations.exporting'),
      description: t('operations.exportingDesc'),
    });
    // TODO: Implement export
  };

  const clearFilters = () => {
    setTypeFilter('all');
    setSourceFilter('all');
    setWarehouseFilter('all');
    setStaffFilter('all');
    setDateRangeFilter('all');
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
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{t('operations.today')}</SelectItem>
                <SelectItem value="yesterday">{t('operations.yesterday')}</SelectItem>
                <SelectItem value="last7">{t('operations.last7Days')}</SelectItem>
                <SelectItem value="last30">{t('operations.last30Days')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 gap-2">
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
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.totalActivities')}</div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.byType?.adjustment || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.adjustments')}</div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.byType?.order_created || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.transfers')}</div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.thisWeek || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.counts')}</div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.byType?.order_created || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.orders')}</div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-foreground">{summary.mobileActivities || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.scans')} ({t('operations.mobile')})</div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-emerald-600">+{summary.byType?.initial_stock || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.stockAdded')}</div>
                  </CardContent>
                </Card>
                <Card className="border border-border bg-white shadow-none">
                  <CardContent className="px-2 py-3 text-center">
                    <div className="text-lg font-bold text-red-600">-{summary.byType?.order_created || 0}</div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{t('operations.stockRemoved')}</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
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

        {/* Filters Bar */}
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
                <SheetDescription className="text-left">{t('operations.filterActivities')}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
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
                      { value: 'SCAN', label: t('operations.scan') },
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
                            {format(new Date(activity.createdAt), 'MMM d, h:mm')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs">{getActivityTypeLabel(activity.activityType)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {activity.product ? (
                              <div>
                                <div className="text-sm font-medium">{activity.product.title}</div>
                                <div className="text-xs text-muted-foreground">{activity.product.sku}</div>
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
                            {activity.stockBefore !== undefined && activity.stockAfter !== undefined
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
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('operations.showing')} 1-20 {t('operations.of')} 1,250</span>
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
                <span className="text-xs text-muted-foreground">ID: {currentDisplayActivity.code}</span>
              </div>

              {/* Product */}
              {currentDisplayActivity.product && (
                <Card className="border border-border bg-muted/50 shadow-none">
                  <CardContent className="px-3 py-3">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">{t('operations.product')}</h3>
                      <div className="flex items-start gap-2">
                        <Coffee className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{displayActivity.product.title}</p>
                          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                            <div>
                              <span className="font-medium">SKU:</span> {displayActivity.product.sku}
                            </div>
                            {displayActivity.product.barcode && (
                              <div>
                                <span className="font-medium">{t('operations.barcode')}:</span> {displayActivity.product.barcode}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {displayActivity.product.id && (
                        <div className="pt-2 border-t border-border">
                          <Button variant="outline" size="sm" className="gap-1 text-xs w-full sm:w-auto">
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
              {displayActivity.stockBefore !== undefined && displayActivity.stockAfter !== undefined && (
                <Card className="border border-border bg-muted/50 shadow-none">
                  <CardContent className="px-3 py-3">
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">{t('operations.stockChange')}</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">{t('operations.before')}</p>
                          <p className="font-medium">{displayActivity.stockBefore}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('operations.after')}</p>
                          <p className="font-medium">{displayActivity.stockAfter}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('operations.change')}</p>
                          <p className={`font-semibold ${displayActivity.quantity > 0 ? 'text-emerald-600' : displayActivity.quantity < 0 ? 'text-red-600' : ''}`}>
                            {displayActivity.quantity > 0 ? '+' : ''}{displayActivity.quantity}
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
                          <span className="font-medium">{getSourceLabel(displayActivity.source)} ({displayActivity.source})</span>
                        </div>
                      </div>
                      {displayActivity.reason && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t('operations.reason')}</span>
                          <span className="font-medium">{displayActivity.reason}</span>
                        </div>
                      )}
                      {displayActivity.notes && (
                        <div className="flex items-start justify-between pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground">{t('operations.notes')}</span>
                          <span className="text-right flex-1 ml-4">{displayActivity.notes}</span>
                        </div>
                      )}
                      {displayActivity.warehouse && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t('operations.warehouse')}</span>
                          <span className="font-medium">{displayActivity.warehouse.name}</span>
                        </div>
                      )}
                      {displayActivity.reference && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{t('operations.reference')}</span>
                            <span className="font-medium">{displayActivity.reference.code}</span>
                          </div>
                          <Button variant="outline" size="sm" className="w-full gap-1 h-6 px-2 text-xs">
                            {t('common.view')}
                            <ArrowRight className="h-3 w-3" />
                          </Button>
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
                      {displayActivity.staff && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{t('operations.staff')}</span>
                            <span className="font-medium">
                              {displayActivity.staff.name} {displayActivity.staff.email && `(${displayActivity.staff.email})`}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{t('operations.dateTime')}</span>
                        <span className="font-medium">
                          {format(new Date(displayActivity.createdAt), 'MMMM d, yyyy, h:mm:ss a')}
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
