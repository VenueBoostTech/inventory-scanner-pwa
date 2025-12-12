import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';
import { Smartphone, CheckCircle2, History, Info } from 'lucide-react';
import { useLoginHistory } from '@/hooks/api/useLoginHistory';
import { formatDistanceToNow } from 'date-fns';

export function RecentLoginsScreen() {
  const { t } = useI18n();
  const { data: loginHistory, isLoading, error } = useLoginHistory();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getPlatformIcon = () => {
    return <Smartphone className="h-5 w-5 text-muted-foreground" />;
  };

  const getDeviceDisplayName = (deviceInfo: { platform?: string; deviceModel?: string }) => {
    if (deviceInfo.deviceModel) {
      return deviceInfo.deviceModel;
    }
    if (deviceInfo.platform) {
      return deviceInfo.platform === 'ios' ? 'iOS Device' : 'Android Device';
    }
    return t('auth.recentLogins.unknownDevice');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('auth.recentLogins.title')} showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">{t('auth.recentLogins.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('auth.recentLogins.subtitle')}</p>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-border bg-white shadow-none">
                <CardContent className="px-3 py-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="border border-red-200 bg-red-50 shadow-none">
            <CardContent className="px-3 py-3">
              <p className="text-sm text-red-700">{t('auth.recentLogins.errorLoading')}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && loginHistory && loginHistory.length === 0 && (
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-8">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <History className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{t('auth.recentLogins.noHistory')}</p>
                <p className="text-xs text-muted-foreground text-center max-w-xs">
                  {t('auth.recentLogins.noHistoryDesc')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && loginHistory && loginHistory.length > 0 && (
          <div className="space-y-3">
            {loginHistory.map((session, index) => {
              const loginDate = session.loginAt?.date ? new Date(session.loginAt.date) : null;
              return (
                <Card key={index} className="border border-border bg-white shadow-none">
                  <CardContent className="px-3 py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {getPlatformIcon()}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">
                            {getDeviceDisplayName(session.deviceInfo)}
                          </p>
                          {session.isCurrentSession && (
                            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span className="text-xs font-medium text-emerald-600">{t('auth.recentLogins.activeNow')}</span>
                            </div>
                          )}
                        </div>
                        {session.loginAt && (
                          <p className="text-xs text-muted-foreground">
                            {session.loginAt.formattedDateTime}
                            {session.ipAddress && ` • ${session.ipAddress}`}
                          </p>
                        )}
                        {loginDate && (
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(loginDate, { addSuffix: true })}
                          </p>
                        )}
                        {session.deviceInfo.appVersion && (
                          <p className="text-xs text-muted-foreground">
                            {t('auth.recentLogins.appVersion')}: {session.deviceInfo.appVersion}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && !error && loginHistory && loginHistory.length > 0 && (
          <Card className="border border-blue-200 bg-blue-50/50 shadow-none">
            <CardContent className="px-3 py-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-blue-600" />
                <p className="text-xs text-blue-900">
                  {t('auth.recentLogins.limitedHistory')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
