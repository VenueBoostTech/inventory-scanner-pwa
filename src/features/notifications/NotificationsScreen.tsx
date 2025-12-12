import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/api/useNotifications';
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
    const createdAt = typeof notif.createdAt === 'string' ? new Date(notif.createdAt) : notif.createdAt;
    if (isToday(createdAt)) {
      groups.today.push(notif);
    } else if (isYesterday(createdAt)) {
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
  
  // API hooks
  const { data: notificationsData, isLoading } = useNotifications({ limit: 100 });
  const { mutateAsync: markAsRead } = useMarkNotificationAsRead();
  const { mutateAsync: markAllAsRead, isPending: isMarkingAll } = useMarkAllNotificationsAsRead();

  const notifications = notificationsData || [];

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(notifications);
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const formatTimeAgo = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    const diffInDays = differenceInDays(now, dateObj);

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

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('common.somethingWentWrong'),
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: t('notifications.allMarkedRead'),
        description: t('notifications.allMarkedReadDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error?.response?.data?.message || t('common.somethingWentWrong'),
        variant: 'destructive',
      });
    }
  };

  const handleNotificationTap = async (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
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
              disabled={isMarkingAll}
              className="w-full text-xs"
            >
              {isMarkingAll ? t('common.loading') : t('notifications.markAllRead')}
            </Button>
          </div>
        )}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border border-border bg-white shadow-none">
                <CardContent className="px-3 py-3">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notifications.length === 0 ? (
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
