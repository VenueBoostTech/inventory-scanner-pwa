import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { useScanHistory } from '@/hooks/api/useScanHistory';
import { authStore } from '@/stores/authStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, Plus, Search as SearchIcon, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function AllScansScreen() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const profile = authStore((state) => state.profile);
  const warehouseId = profile?.permissions?.warehouseIds?.[0];

  const { data: scanHistoryData, isLoading } = useScanHistory({
    limit: 100,
    warehouseId,
  });

  const scans = scanHistoryData?.data || [];

  const formatResult = (result: string) => {
    const map: Record<string, { label: string; className: string; icon: React.ReactElement }> = {
      found: {
        label: t('scan.found'),
        className: 'bg-emerald-50 text-emerald-700',
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      not_found: {
        label: t('scan.notFound'),
        className: 'bg-red-50 text-red-700',
        icon: <XCircle className="h-4 w-4" />,
      },
      created: {
        label: t('scan.created'),
        className: 'bg-blue-50 text-blue-700',
        icon: <Plus className="h-4 w-4" />,
      },
      error: {
        label: t('common.error'),
        className: 'bg-amber-50 text-amber-700',
        icon: <AlertCircle className="h-4 w-4" />,
      },
    };
    return map[result] ?? map.found;
  };

  const formatAction = (action: string) => {
    const map: Record<string, { label: string; icon: React.ReactElement }> = {
      lookup: { label: t('scan.lookup'), icon: <SearchIcon className="h-4 w-4" /> },
      add_product: { label: t('scan.added'), icon: <Plus className="h-4 w-4" /> },
      stock_adjust: { label: t('scan.adjusted'), icon: <AlertCircle className="h-4 w-4" /> },
      stock_count: { label: t('scan.counted'), icon: <AlertCircle className="h-4 w-4" /> },
    };
    return map[action] ?? map.lookup;
  };

  const formatTimeAgo = (date: string | Date) => {
    const target = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(target, { addSuffix: true });
  };

  const filteredScans = scans.filter((scan) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      scan.product?.title?.toLowerCase().includes(searchLower) ||
      scan.product?.sku?.toLowerCase().includes(searchLower) ||
      scan.barcode?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('scan.recentScans')} showBack />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t('scan.recentScans')}</h1>
          <p className="text-sm text-muted-foreground">{t('scan.latestLookups')}</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('common.search')}
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
              ) : filteredScans.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">{t('scan.product')}</TableHead>
                      <TableHead className="min-w-[120px]">{t('scan.barcode')}</TableHead>
                      <TableHead className="min-w-[180px]">{t('scan.status')}</TableHead>
                      <TableHead className="min-w-[100px] text-right">{t('scan.time')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredScans.map((scan) => {
                      const status = formatResult(scan.result);
                      const action = formatAction(scan.action);
                      return (
                        <TableRow key={scan.id}>
                          <TableCell className="align-middle min-w-[200px]">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-foreground">
                                {scan.product?.title ?? 'Unknown product'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {scan.product?.sku || '-'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground min-w-[120px]">
                            {scan.barcode || '-'}
                          </TableCell>
                          <TableCell className="min-w-[180px]">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                {action.icon}
                                {action.label}
                              </span>
                              <Badge className={status.className} variant="secondary">
                                <span className="flex items-center gap-1">
                                  {status.icon}
                                  {status.label}
                                </span>
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground min-w-[100px]">
                            {formatTimeAgo(scan.scannedAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

