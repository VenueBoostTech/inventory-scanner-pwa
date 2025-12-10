import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Search,
  Package,
  ClipboardList,
  Truck,
  Scan,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type DateFilter = 'today' | 'yesterday' | 'this_week' | 'last_7_days' | 'this_month';

interface DateRange {
  dateFrom: Date;
  dateTo: Date;
}

function getDateRange(filter: DateFilter): DateRange {
  const now = new Date();
  
  switch (filter) {
    case 'today':
      return {
        dateFrom: startOfDay(now),
        dateTo: endOfDay(now),
      };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return {
        dateFrom: startOfDay(yesterday),
        dateTo: endOfDay(yesterday),
      };
    case 'this_week':
      return {
        dateFrom: startOfWeek(now, { weekStartsOn: 1 }),
        dateTo: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'last_7_days':
      return {
        dateFrom: startOfDay(subDays(now, 7)),
        dateTo: endOfDay(now),
      };
    case 'this_month':
      return {
        dateFrom: startOfMonth(now),
        dateTo: endOfMonth(now),
      };
    default:
      return {
        dateFrom: startOfDay(now),
        dateTo: endOfDay(now),
      };
  }
}

function formatDateRange(filter: DateFilter): string {
  const range = getDateRange(filter);
  if (filter === 'today') {
    return format(range.dateFrom, 'MMM d, yyyy');
  }
  if (filter === 'yesterday') {
    return format(range.dateFrom, 'MMM d, yyyy');
  }
  return `${format(range.dateFrom, 'MMM d')} - ${format(range.dateTo, 'MMM d, yyyy')}`;
}

// Mock data
const mockStats = {
  scans: 25,
  adjustments: 8,
  stockCounts: 2,
  transfers: 1,
};

const mockAlerts = {
  outOfStock: 12,
  lowStock: 45,
};

const mockRecentScans = [
  {
    id: '1',
    productName: 'Premium Coffee Beans',
    barcode: '8901234567890',
    status: 'found',
    time: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  },
  {
    id: '2',
    productName: 'Organic Tea',
    barcode: '8901234567891',
    status: 'found',
    time: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
  },
  {
    id: '3',
    productName: 'Unknown',
    barcode: '8901234567892',
    status: 'not_found',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '4',
    productName: 'Bottled Water',
    barcode: '8901234567893',
    status: 'found',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: '5',
    productName: 'New Product',
    barcode: '8901234567894',
    status: 'created',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
];

const mockRecentActivities = [
  {
    id: '1',
    type: 'adjustment',
    action: 'increase',
    productName: 'Coffee Beans',
    quantity: 50,
    time: new Date(Date.now() - 28 * 60 * 1000), // 28 mins ago
  },
  {
    id: '2',
    type: 'adjustment',
    action: 'decrease',
    productName: 'Tea',
    quantity: 10,
    time: new Date(Date.now() - 40 * 60 * 1000), // 40 mins ago
  },
  {
    id: '3',
    type: 'count',
    action: 'completed',
    productName: 'Stock Count',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '4',
    type: 'transfer',
    action: 'completed',
    productName: 'Transfer',
    time: new Date(Date.now() - 3.5 * 60 * 60 * 1000), // 3.5 hours ago
  },
];

export function DashboardScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'found':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'not_found':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'created':
        return <Plus className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'found':
        return 'Found';
      case 'not_found':
        return 'Not Found';
      case 'created':
        return 'Created';
      default:
        return status;
    }
  };

  const getActivityIcon = (type: string, action: string) => {
    if (type === 'adjustment') {
      return action === 'increase' ? (
        <TrendingUp className="h-4 w-4 text-emerald-600" />
      ) : (
        <TrendingUp className="h-4 w-4 rotate-180 text-red-600" />
      );
    }
    if (type === 'count') {
      return <ClipboardList className="h-4 w-4 text-blue-600" />;
    }
    if (type === 'transfer') {
      return <Truck className="h-4 w-4 text-purple-600" />;
    }
    return null;
  };

  const formatActivityText = (activity: typeof mockRecentActivities[0]) => {
    if (activity.type === 'adjustment') {
      const sign = activity.action === 'increase' ? '+' : '-';
      return `${activity.productName} ${sign}${activity.quantity}`;
    }
    if (activity.type === 'count') {
      return `${activity.productName} completed`;
    }
    if (activity.type === 'transfer') {
      return `${activity.productName} completed`;
    }
    return activity.productName;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('dashboard.title')} />
      <div className="space-y-4 px-4 py-4">
        {/* Date Filter Bar */}
        <Card className="border border-border bg-white shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#043f3b]" />
                <span className="text-sm font-medium text-foreground">
                  {format(new Date(), 'MMM d, yyyy')}
                </span>
              </div>
              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
                <SelectTrigger className="h-9 w-[180px] border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">{t('dashboard.dateFilter.today')}</SelectItem>
                  <SelectItem value="yesterday">{t('dashboard.dateFilter.yesterday')}</SelectItem>
                  <SelectItem value="this_week">{t('dashboard.dateFilter.thisWeek')}</SelectItem>
                  <SelectItem value="last_7_days">{t('dashboard.dateFilter.last7Days')}</SelectItem>
                  <SelectItem value="this_month">{t('dashboard.dateFilter.thisMonth')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <Search className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-foreground">{mockStats.scans}</p>
                  <p className="text-xs text-muted-foreground">{t('dashboard.scans')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-foreground">{mockStats.adjustments}</p>
                  <p className="text-xs text-muted-foreground">{t('dashboard.adjustments')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-foreground">{mockStats.stockCounts}</p>
                  <p className="text-xs text-muted-foreground">{t('dashboard.stockCounts')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-foreground">{mockStats.transfers}</p>
                  <p className="text-xs text-muted-foreground">{t('dashboard.transfers')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="px-3 pt-3 pb-2">
            <CardTitle className="text-base font-semibold text-foreground">{t('dashboard.quickActions')}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t('dashboard.commonOperations')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border-border bg-white hover:bg-[#164945]/5"
                onClick={() => navigate('/scan')}
              >
                <Scan className="h-6 w-6 text-[#164945]" />
                <span className="text-xs font-semibold text-foreground">{t('dashboard.scan')}</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border-border bg-white hover:bg-[#164945]/5"
                onClick={() => navigate('/operations/adjustments')}
              >
                <Package className="h-6 w-6 text-[#164945]" />
                <span className="text-xs font-semibold text-foreground">ADJUST</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border-border bg-white hover:bg-[#164945]/5"
                onClick={() => navigate('/operations/counts')}
              >
                <ClipboardList className="h-6 w-6 text-[#164945]" />
                <span className="text-xs font-semibold text-foreground">{t('dashboard.count')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts/Attention */}
        <Card className="border border-amber-200 bg-amber-50/50 shadow-none">
          <CardContent className="px-3 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">{t('dashboard.attention')}</span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="font-semibold text-foreground">{mockAlerts.outOfStock}</span>
                <span className="text-muted-foreground">{t('dashboard.outOfStock')}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="font-semibold text-foreground">{mockAlerts.lowStock}</span>
                <span className="text-muted-foreground">{t('dashboard.lowStock')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-3 px-3 pt-3 pb-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-foreground">
                {t('dashboard.recentScans')}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t('dashboard.latestLookups')}
              </CardDescription>
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate('/scan')}
                className="mt-2 flex items-center gap-1 text-sm font-medium text-[#164945] hover:underline cursor-pointer"
              >
                {t('common.seeAll')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-3 mt-2 pb-3">
            <div className="space-y-3">
              {mockRecentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{scan.productName}</p>
                    <p className="text-xs text-muted-foreground">{scan.barcode}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(scan.status)}
                      <span className="text-xs font-medium text-foreground">
                        {getStatusLabel(scan.status)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(scan.time, 'HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="border border-border bg-white shadow-none">
          <CardHeader className="flex flex-row items-start justify-between gap-3 px-3 pt-3 pb-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-foreground">
                {t('dashboard.recentActivities')}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {t('dashboard.recentOperations')}
              </CardDescription>
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate('/operations/activities')}
                className="mt-2 flex items-center gap-1 text-sm font-medium text-[#164945] hover:underline cursor-pointer"
              >
                {t('common.seeAll')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-3 mt-2 pb-3">
            <div className="space-y-3">
              {mockRecentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {getActivityIcon(activity.type, activity.action)}
                    <p className="text-sm font-semibold text-foreground">
                      {formatActivityText(activity)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {format(activity.time, 'HH:mm')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

