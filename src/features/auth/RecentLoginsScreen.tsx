import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Smartphone, CheckCircle2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// Mock data
const mockLoginHistory = [
  {
    id: 'session_001',
    deviceInfo: {
      platform: 'ios',
      deviceModel: 'iPhone 14 Pro',
      appVersion: '1.0.0',
    },
    ipAddress: '185.123.xxx.xxx',
    location: 'Tirana, AL',
    loginAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isCurrentSession: true,
  },
  {
    id: 'session_002',
    deviceInfo: {
      platform: 'ios',
      deviceModel: 'iPhone 14 Pro',
      appVersion: '1.0.0',
    },
    ipAddress: '185.123.xxx.xxx',
    location: 'Tirana, AL',
    loginAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    isCurrentSession: false,
  },
  {
    id: 'session_003',
    deviceInfo: {
      platform: 'ios',
      deviceModel: 'iPhone 14 Pro',
      appVersion: '1.0.0',
    },
    ipAddress: '185.123.xxx.xxx',
    location: 'Tirana, AL',
    loginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isCurrentSession: false,
  },
  {
    id: 'session_004',
    deviceInfo: {
      platform: 'android',
      deviceModel: 'Android Device',
      appVersion: '1.0.0',
    },
    ipAddress: '185.123.xxx.xxx',
    location: 'Durres, AL',
    loginAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    isCurrentSession: false,
  },
];

export function RecentLoginsScreen() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title="Recent Logins" showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">Recent Logins</h1>
          <p className="text-sm text-muted-foreground">View your recent login sessions and active devices</p>
        </div>
        <div className="space-y-3">
          {mockLoginHistory.map((session) => (
          <Card key={session.id} className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {session.deviceInfo.deviceModel}
                    </p>
                    {session.isCurrentSession && (
                      <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600">Active now</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(session.loginAt, 'MMM d, HH:mm')} • {session.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(session.loginAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
