import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const updateQueueCount = async () => {
      const count = await db.mutationQueue.count();
      setQueueCount(count);
    };

    updateQueueCount();
    const interval = setInterval(updateQueueCount, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline && queueCount > 0 && !isSyncing) {
      void syncQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, queueCount]);

  const syncQueue = async () => {
    setIsSyncing(true);
    try {
      const mutations = await db.mutationQueue.toArray();
      for (const mutation of mutations) {
        try {
          await api({
            method: mutation.method,
            url: mutation.endpoint,
            data: mutation.data,
          });
          await db.mutationQueue.delete(mutation.id!);
        } catch (error) {
          await db.mutationQueue.update(mutation.id!, {
            retries: mutation.retries + 1,
          });
          if (mutation.retries >= 3) {
            await db.mutationQueue.delete(mutation.id!);
          }
        }
      }
      if (mutations.length) {
        toast({
          title: 'Synced',
          description: `${mutations.length} operations synced successfully`,
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return { isOnline, isSyncing, queueCount, syncQueue };
}

