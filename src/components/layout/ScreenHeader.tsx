import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  action?: ReactNode;
}

export function ScreenHeader({ title, action }: ScreenHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background px-4 py-3 pt-safe-top">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        {action}
      </div>
    </header>
  );
}

