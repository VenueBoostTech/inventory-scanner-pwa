import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ScreenHeaderProps {
  title: string;
  action?: ReactNode;
}

const LogoMark = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-lg bg-[#043f3b]/10 text-[#043f3b]',
      className,
    )}
    aria-label="Inventory Scanner"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-5 w-5" role="img">
      <path
        fill="currentColor"
        d="M12 10h40a2 2 0 0 1 2 2v40a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Zm4 8v28h32V18H16Zm6 4h20v4H22v-4Zm0 10h20v4H22v-4Z"
      />
    </svg>
  </div>
);

export function ScreenHeader({ title, action }: ScreenHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b bg-white px-4 pt-safe-top">
      <div className="flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LogoMark />
        </div>
        <div className="flex items-center gap-3 text-[#043f3b]">
          <button
            type="button"
            onClick={() => navigate('/scan')}
            className="rounded-full p-2 hover:bg-[#043f3b]/5"
            aria-label="Scan"
          >
            <Scan className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-[#043f3b]/5"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="rounded-full hover:bg-[#043f3b]/5"
            aria-label="Account"
          >
            <Avatar className="h-9 w-9 border border-[#043f3b]/20">
              <AvatarFallback className="bg-[#043f3b]/10 text-[#043f3b] font-semibold">
                U
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
      {action ? <div className="mt-3">{action}</div> : null}
    </header>
  );
}

