import { NavLink } from 'react-router-dom';
import { Activity, Package, Scan, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/scan', icon: Scan, label: 'Scan' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/activities', icon: Activity, label: 'Activity' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background pb-safe-bottom">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex h-full flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-6 w-6', isActive && 'text-primary')} />
                <span className="font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

