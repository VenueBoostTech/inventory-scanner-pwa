import { NavLink } from 'react-router-dom';
import { Activity, Gauge, Package, Scan, User } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const { t } = useI18n();
  
  const navItems = [
    { to: '/dashboard', icon: Gauge, label: t('dashboard.title') },
    { to: '/products', icon: Package, label: t('products.title') },
    { to: '/scan', icon: Scan, label: t('scan.title') },
    { to: '/operations', icon: Activity, label: t('operations.title') },
    { to: '/account', icon: User, label: t('auth.profile.title') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white pb-safe-bottom">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex h-full flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive
                  ? 'font-semibold text-[#043f3b]'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <div
                className={cn(
                  'flex h-full w-full flex-col items-center justify-center gap-1',
                  isActive
                    ? 'relative after:absolute after:bottom-0 after:h-0.5 after:w-10 after:rounded-full after:bg-[#043f3b]'
                    : '',
                )}
              >
                <item.icon className={cn('h-6 w-6', isActive && 'text-[#043f3b]')} />
                <span className={cn('font-medium', isActive && 'font-semibold text-[#043f3b]')}>
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

