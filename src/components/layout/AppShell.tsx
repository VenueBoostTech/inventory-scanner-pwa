import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { ScrollToTop } from '../ScrollToTop';

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ScrollToTop />
      <main className="flex-1 overflow-auto pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

