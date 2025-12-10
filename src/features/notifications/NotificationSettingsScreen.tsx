import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function NotificationSettingsScreen() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    lowStockAlerts: true,
    outOfStockAlerts: true,
    transferUpdates: true,
    countReminders: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast({
      title: t('notifications.settingsUpdated'),
      description: t('notifications.settingsUpdatedDesc'),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <ScreenHeader title={t('notifications.settings')} showBack />
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t('notifications.pushNotifications')}
          </h2>

          {/* Low Stock Alerts */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('notifications.lowStockAlerts')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('notifications.lowStockAlertsDesc')}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('lowStockAlerts')}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    settings.lowStockAlerts ? 'bg-[#164945]' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.lowStockAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Out of Stock Alerts */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('notifications.outOfStockAlerts')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('notifications.outOfStockAlertsDesc')}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('outOfStockAlerts')}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    settings.outOfStockAlerts ? 'bg-[#164945]' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.outOfStockAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Updates */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('notifications.transferUpdates')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('notifications.transferUpdatesDesc')}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('transferUpdates')}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    settings.transferUpdates ? 'bg-[#164945]' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.transferUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Count Reminders */}
          <Card className="border border-border bg-white shadow-none">
            <CardContent className="px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{t('notifications.countReminders')}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('notifications.countRemindersDesc')}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle('countReminders')}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    settings.countReminders ? 'bg-[#164945]' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.countReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
