import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { isToday, isYesterday, differenceInDays } from 'date-fns';
import {
  AlertCircle,
  AlertTriangle,
  Truck,
  ClipboardList,
  Package,
  CheckCircle2,
  Settings,
} from 'lucide-react';

// Mock data
const mockNotifications = [
  {
    id: 'notif_001',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Coffee Beans is running low (5 left)',
    isRead: false,
    data: {
      productId: 'prod_001',
      productName: 'Coffee Beans',
      currentStock: 5,
      threshold: 10,
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'notif_002',
    type: 'transfer',
    title: 'Transfer Completed',
    message: 'Transfer #TRF-005 to Secondary done',
    isRead: false,
    data: {
      transferId: 'trf_005',
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'notif_003',
    type: 'approval',
    title: 'Count Approved',
    message: 'Stock Count #CNT-003 was approved',
    isRead: false,
    data: {
      countId: 'cnt_003',
    },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: 'notif_004',
    type: 'out_of_stock',
    title: 'Out of Stock',
    message: 'Milk is now out of stock',
    isRead: true,
    data: {
      productId: 'prod_004',
      productName: 'Milk',
    },
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
  },
  {
    id: 'notif_005',
    type: 'adjustment',
    title: 'Adjustment Needed',
    message: 'Discrepancy found in Tea Bags',
    isRead: true,
    data: {
      productId: 'prod_002',
      productName: 'Tea Bags',
    },
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
  },
  {
    id: 'notif_006',
    type: 'transfer',
    title: 'Transfer Pending',
    message: 'Transfer #TRF-004 waiting approval',
    isRead: true,
    data: {
      transferId: 'trf_004',
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'low_stock':
      return AlertCircle;
    case 'out_of_stock':
      return AlertTriangle;
    case 'transfer':
      return Truck;
    case 'count':
      return ClipboardList;
    case 'adjustment':
      return Package;
    case 'approval':
      return CheckCircle2;
    default:
      return AlertCircle;
  }
};

const getNotificationIconColor = (type: string) => {
  switch (type) {
    case 'low_stock':
      return 'text-red-600';
    case 'out_of_stock':
      return 'text-amber-600';
    case 'transfer':
      return 'text-blue-600';
    case 'count':
      return 'text-purple-600';
    case 'adjustment':
      return 'text-orange-600';
    case 'approval':
      return 'text-emerald-600';
    default:
      return 'text-muted-foreground';
  }
};


const groupNotificationsByDate = (notifications: any[]) => {
  const groups: Record<string, any[]> = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  notifications.forEach((notif) => {
    if (isToday(notif.createdAt)) {
      groups.today.push(notif);
    } else if (isYesterday(notif.createdAt)) {
      groups.yesterday.push(notif);
    } else {
      groups.earlier.push(notif);
    }
  });

  return groups;
};

export function NotificationsScreen() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(mockNotifications);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(notifications);
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = differenceInDays(now, date);

    if (diffInHours < 1) {
      return t('notifications.justNow');
    } else if (diffInHours < 24) {
      return `${diffInHours}${t('notifications.hoursAgo')}`;
    } else if (diffInDays === 1) {
      return `1${t('notifications.daysAgo')}`;
    } else {
      return `${diffInDays}${t('notifications.daysAgo')}`;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast({
      title: t('notifications.allMarkedRead'),
      description: t('notifications.allMarkedReadDesc'),
    });
  };

  const handleNotificationTap = (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on type
    switch (notification.type) {
      case 'low_stock':
      case 'out_of_stock':
      case 'adjustment':
        if (notification.data?.productId) {
          navigate(`/products`);
        }
        break;
      case 'transfer':
        if (notification.data?.transferId) {
          navigate(`/operations/transfers`);
        }
        break;
      case 'count':
        if (notification.data?.countId) {
          navigate(`/operations/counts/${notification.data.countId}`);
        }
        break;
      default:
        break;
    }
  };

  const renderNotificationGroup = (title: string, groupNotifications: any[]) => {
    if (groupNotifications.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground px-1">
          {title}
        </h3>
        <div className="space-y-3">
          {groupNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const iconColor = getNotificationIconColor(notification.type);

            return (
              <Card
                key={notification.id}
                className={`border border-border bg-white shadow-none cursor-pointer hover:bg-muted/50 transition-colors ${
                  !notification.isRead ? 'ring-1 ring-blue-200' : ''
                }`}
                onClick={() => handleNotificationTap(notification)}
              >
                <CardContent className="px-3 py-3">
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 ${iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-foreground`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('notifications.title')} showBack={false} />
      <div className="space-y-4 px-4 py-4">
        {/* Title and Subtitle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-foreground">{t('notifications.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('notifications.subtitle')}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/notifications/settings')}
            className="h-10 w-10 p-0 shrink-0"
            title={t('notifications.settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="w-full text-xs"
            >
              {t('notifications.markAllRead')}
            </Button>
          </div>
        )}
        {notifications.length === 0 ? (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t('notifications.noNotifications')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {renderNotificationGroup(t('notifications.today'), groupedNotifications.today)}
            {renderNotificationGroup(t('notifications.yesterday'), groupedNotifications.yesterday)}
            {renderNotificationGroup(t('notifications.earlier'), groupedNotifications.earlier)}

            {/* Load More */}
            {notifications.length > 6 && (
              <Button variant="outline" className="w-full">
                {t('notifications.loadMore')}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
