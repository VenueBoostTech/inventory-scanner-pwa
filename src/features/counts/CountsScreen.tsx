import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useStockCounts, useCreateStockCount } from '@/hooks/api/useStockCounts';
import { useWarehouses } from '@/hooks/api/useWarehouses';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

export function CountsScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [startWarehouse, setStartWarehouse] = useState('');
  const [countScope, setCountScope] = useState<'full' | 'category' | 'location' | 'specific'>('full');
  const [startNotes, setStartNotes] = useState('');

  // API hooks
  const { data: countsData, isLoading: countsLoading } = useStockCounts({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    warehouseId: warehouseFilter !== 'all' ? warehouseFilter : undefined,
    limit: 100,
  });
  const { data: warehouses = [] } = useWarehouses({ limit: 100 });
  const { mutateAsync: createStockCount, isPending: isCreating } = useCreateStockCount();

  const counts = countsData?.data || [];

  type SortOption = 'recent' | 'status' | 'warehouse';

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      in_progress: {
        label: t('operations.inProgress'),
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: null,
      },
      completed: {
        label: t('operations.completed'),
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: CheckCircle2,
      },
      cancelled: {
        label: t('operations.cancelled'),
        className: 'bg-red-50 text-red-700 border-red-200',
        icon: XCircle,
      },
    };
    const statusInfo = statusMap[status] || statusMap.in_progress;
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.icon && <statusInfo.icon className="h-3 w-3 mr-1" />}
        {statusInfo.label}
      </Badge>
    );
  };

  const handleStart = () => {
    setStartModalOpen(true);
  };

  const handleStartCount = async () => {
    if (!startWarehouse) {
      toast({
        title: t('common.error'),
        description: t('operations.selectWarehouse'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createStockCount({
        warehouseId: startWarehouse,
        notes: startNotes || undefined,
      });
      toast({
        title: t('operations.countStarted'),
        description: t('operations.countStartedDesc'),
      });
      setStartModalOpen(false);
      setStartWarehouse('');
      setCountScope('full');
      setStartNotes('');
      navigate(`/operations/counts/${result.stockCount.id}/counting`);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('operations.countStartedDesc'),
        variant: 'destructive',
      });
    }
  };

  // handleContinue removed - unused

  const handleViewDetails = (count: any) => {
    if (count.status === 'in_progress') {
      navigate(`/operations/counts/${count.id}/counting`);
    } else {
      navigate(`/operations/counts/${count.id}`);
    }
  };

  const handleViewReport = (count: any) => {
    navigate(`/operations/counts/${count.id}/report`);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setWarehouseFilter('all');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('operations.stockCounts')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle with Start Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground">{t('operations.stockCounts')}</h1>
            <p className="text-sm text-muted-foreground">{t('operations.countsSubtitle')}</p>
          </div>
          <button
            onClick={handleStart}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#164945] text-white hover:bg-[#123b37] transition-colors"
            title={t('operations.startCount')}
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
                <SheetDescription className="text-left">{t('operations.filterCounts')}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-left">{t('operations.status')}</label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: t('operations.all') },
                      { value: 'in_progress', label: t('operations.inProgress') },
                      { value: 'completed', label: t('operations.completed') },
                      { value: 'cancelled', label: t('operations.cancelled') },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={statusFilter === option.value}
                          onChange={(e) => setStatusFilter(e.target.value)}
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
              <SelectItem value="status">{t('operations.status')}</SelectItem>
              <SelectItem value="warehouse">{t('operations.warehouse')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Counts Table */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="p-0">
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">ID</TableHead>
                    <TableHead className="min-w-[120px]">{t('operations.warehouse')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('operations.status')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('operations.progress')}</TableHead>
                    <TableHead className="min-w-[140px]">{t('operations.discrepancies')}</TableHead>
                    <TableHead className="min-w-[100px]">{t('operations.date')}</TableHead>
                    <TableHead className="min-w-[80px] text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : counts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                        {t('operations.noCounts')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    counts
                    .filter((count) => {
                      // Search filter (client-side since API may not support it)
                      if (search) {
                        const searchLower = search.toLowerCase();
                        return (
                          count.referenceNumber.toLowerCase().includes(searchLower) ||
                          count.warehouse.name.toLowerCase().includes(searchLower)
                        );
                      }
                      return true;
                    })
                    .sort((a, b) => {
                      if (sortBy === 'recent') {
                        const aDate = a.startedAt || a.completedAt || new Date(0);
                        const bDate = b.startedAt || b.completedAt || new Date(0);
                        return new Date(bDate).getTime() - new Date(aDate).getTime();
                      } else if (sortBy === 'status') {
                        return a.status.localeCompare(b.status);
                      } else if (sortBy === 'warehouse') {
                        return a.warehouse.name.localeCompare(b.warehouse.name);
                      }
                      return 0;
                    })
                    .map((count) => {
                      const progress = count.totalItemsCounted ? Math.round((count.totalItemsCounted / (count.totalItemsCounted + (count.itemsWithVariance || 0))) * 100) : 0;
                      return (
                        <TableRow key={count.id}>
                          <TableCell className="font-medium">{count.referenceNumber}</TableCell>
                          <TableCell>{count.warehouse.name}</TableCell>
                          <TableCell>{getStatusBadge(count.status)}</TableCell>
                          <TableCell>
                            {count.status === 'cancelled' ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : count.totalItemsCounted ? (
                              `${count.totalItemsCounted} ${t('operations.items')} (${progress}%)`
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {count.status === 'completed' || count.status === 'in_progress' ? (
                              <span className="text-xs text-muted-foreground">
                                {count.itemsWithVariance || 0} {t('operations.items')}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {count.status === 'completed' && count.completedAt
                              ? format(new Date(count.completedAt), 'MMM d')
                              : count.startedAt
                              ? format(new Date(count.startedAt), 'MMM d')
                              : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewDetails(count)}
                                className="p-1 hover:bg-muted rounded"
                                title={t('operations.viewDetails')}
                              >
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </button>
                              {count.status === 'completed' && (
                                <button
                                  onClick={() => handleViewReport(count)}
                                  className="p-1 hover:bg-muted rounded"
                                  title={t('operations.viewReport')}
                                >
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('operations.showing')} 1-10 {t('operations.of')} 45</span>
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

      {/* Start Count Modal */}
      <Dialog open={startModalOpen} onOpenChange={setStartModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle>{t('operations.startNewCount')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Warehouse */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('operations.warehouse')} <span className="text-red-500">*</span>
              </label>
              <Select value={startWarehouse} onValueChange={setStartWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder={t('operations.selectWarehouse')} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Count Scope */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('operations.countScope')}</label>
              <div className="space-y-2">
                <label className="flex items-start gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="full"
                    checked={countScope === 'full'}
                    onChange={(e) => setCountScope(e.target.value as any)}
                    className="h-4 w-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{t('operations.fullInventory')}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('operations.countAllProducts')} (150 {t('operations.items')})
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="category"
                    checked={countScope === 'category'}
                    onChange={(e) => setCountScope(e.target.value as any)}
                    className="h-4 w-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{t('operations.byCategory')}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('operations.selectSpecificCategories')}
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="location"
                    checked={countScope === 'location'}
                    onChange={(e) => setCountScope(e.target.value as any)}
                    className="h-4 w-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{t('operations.byLocation')}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('operations.countProductsInArea')}
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="specific"
                    checked={countScope === 'specific'}
                    onChange={(e) => setCountScope(e.target.value as any)}
                    className="h-4 w-4 mt-0.5"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{t('operations.specificProducts')}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('operations.selectIndividualProducts')}
                    </p>
                  </div>
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
                placeholder={t('operations.countNotesPlaceholder')}
                value={startNotes}
                onChange={(e) => setStartNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setStartModalOpen(false)}
              className="w-full sm:w-auto"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleStartCount}
              className="w-full sm:w-auto border-none bg-[#164945] text-white hover:bg-[#123b37]"
            >
              {t('operations.startCount')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
