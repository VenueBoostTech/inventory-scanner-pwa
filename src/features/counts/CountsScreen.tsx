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
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data
const mockCounts = [
  {
    id: 'cnt_001',
    code: 'CNT-001',
    status: 'in_progress',
    warehouse: { id: 'wh_001', name: 'Main' },
    totalItems: 150,
    itemsCounted: 45,
    progress: 30,
    discrepancies: 3,
    startedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    createdBy: { id: 'staff_001', name: 'John D.' },
  },
  {
    id: 'cnt_002',
    code: 'CNT-002',
    status: 'completed',
    warehouse: { id: 'wh_002', name: 'Secondary' },
    totalItems: 80,
    itemsCounted: 80,
    discrepancies: 5,
    totalSurplus: 15,
    totalShortage: -8,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedBy: { id: 'staff_002', name: 'Sarah M.' },
  },
  {
    id: 'cnt_003',
    code: 'CNT-003',
    status: 'completed',
    warehouse: { id: 'wh_001', name: 'Main' },
    totalItems: 120,
    itemsCounted: 120,
    discrepancies: 0,
    completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'cnt_004',
    code: 'CNT-004',
    status: 'cancelled',
    warehouse: { id: 'wh_001', name: 'Main' },
    totalItems: 150,
    itemsCounted: 10,
    cancelledAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
  },
];

const mockCountItems = [
  {
    productId: 'prod_001',
    productName: 'Coffee Beans',
    sku: 'COF-001',
    systemQuantity: 150,
    countedQuantity: 148,
    discrepancy: -2,
    status: 'discrepancy',
    notes: '',
  },
  {
    productId: 'prod_002',
    productName: 'Tea Bags',
    sku: 'TEA-001',
    systemQuantity: 80,
    countedQuantity: 80,
    discrepancy: 0,
    status: 'match',
  },
  {
    productId: 'prod_003',
    productName: 'Sugar',
    sku: 'SUG-001',
    systemQuantity: 100,
    countedQuantity: 105,
    discrepancy: 5,
    status: 'discrepancy',
    notes: '',
  },
  {
    productId: 'prod_004',
    productName: 'Milk',
    sku: 'MLK-001',
    systemQuantity: 50,
    countedQuantity: 50,
    discrepancy: 0,
    status: 'match',
  },
];

export function CountsScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

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
    toast({
      title: t('operations.startCount'),
      description: t('common.loading'),
    });
    // TODO: Navigate to start count screen
  };

  const handleContinue = (count: any) => {
    toast({
      title: t('operations.continueCounting'),
      description: t('common.loading'),
    });
    // TODO: Navigate to counting screen
  };

  const handleViewDetails = (count: any) => {
    navigate(`/operations/counts/${count.id}`);
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
                  {mockCounts
                    .filter((count) => {
                      // Status filter
                      if (statusFilter !== 'all' && count.status !== statusFilter) {
                        return false;
                      }
                      // Warehouse filter
                      if (warehouseFilter !== 'all') {
                        const warehouseNameLower = count.warehouse.name.toLowerCase();
                        if (warehouseFilter === 'main' && !warehouseNameLower.includes('main')) {
                          return false;
                        }
                        if (warehouseFilter === 'secondary' && !warehouseNameLower.includes('secondary')) {
                          return false;
                        }
                      }
                      // Search filter
                      if (search) {
                        const searchLower = search.toLowerCase();
                        return (
                          count.code.toLowerCase().includes(searchLower) ||
                          count.warehouse.name.toLowerCase().includes(searchLower)
                        );
                      }
                      return true;
                    })
                    .map((count) => (
                    <TableRow key={count.id}>
                      <TableCell className="font-medium">{count.code}</TableCell>
                      <TableCell>{count.warehouse.name}</TableCell>
                      <TableCell>{getStatusBadge(count.status)}</TableCell>
                      <TableCell>
                        {count.status === 'cancelled' ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          `${count.itemsCounted}/${count.totalItems}`
                        )}
                      </TableCell>
                      <TableCell>
                        {count.status === 'completed' || count.status === 'in_progress' ? (
                          <span className="text-xs text-muted-foreground">
                            {count.discrepancies || 0} {t('operations.items')}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {count.status === 'completed' && count.completedAt
                          ? format(count.completedAt, 'MMM d')
                          : count.status === 'cancelled' && count.cancelledAt
                          ? format(count.cancelledAt, 'MMM d')
                          : format(count.startedAt, 'MMM d')}
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
                  ))}
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
    </div>
  );
}
