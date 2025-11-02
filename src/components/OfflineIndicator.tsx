import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi, RefreshCw, Database, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getStorageStats, syncOfflineData, getPendingActions } from '@/lib/offlineStorage';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [storageStats, setStorageStats] = useState<{
    bookings: number;
    pendingActions: number;
    syncQueue: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Verbindung wiederhergestellt', {
        description: 'Die App ist wieder online',
      });
      // Auto-sync when coming back online
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Offline-Modus', {
        description: 'Änderungen werden lokal gespeichert',
        icon: <WifiOff className="w-4 h-4" />,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const updateStats = async () => {
      const stats = await getStorageStats();
      setStorageStats(stats);
      
      const pending = await getPendingActions();
      setPendingCount(pending.length);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('Keine Verbindung', {
        description: 'Synchronisierung ist nur online möglich',
      });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncOfflineData();
      
      if (result.success > 0) {
        toast.success('Synchronisierung erfolgreich', {
          description: `${result.success} Aktion(en) synchronisiert`,
        });
      }
      
      if (result.failed > 0) {
        toast.error('Synchronisierung teilweise fehlgeschlagen', {
          description: `${result.failed} Aktion(en) fehlgeschlagen`,
        });
      }

      // Update stats after sync
      const stats = await getStorageStats();
      setStorageStats(stats);
      
      const pending = await getPendingActions();
      setPendingCount(pending.length);
    } catch (error) {
      toast.error('Synchronisierung fehlgeschlagen', {
        description: 'Bitte versuchen Sie es später erneut',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Don't show anything if online and no pending actions
  if (isOnline && pendingCount === 0 && !showDetails) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 shadow-lg max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-primary" />
          ) : (
            <WifiOff className="w-5 h-5 text-destructive" />
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              
              {pendingCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Database className="w-3 h-3 mr-1" />
                  {pendingCount} ausstehend
                </Badge>
              )}
            </div>
            
            {!isOnline && (
              <p className="text-xs text-muted-foreground mt-1">
                Änderungen werden lokal gespeichert
              </p>
            )}

            {showDetails && storageStats && (
              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buchungen gecacht:</span>
                  <span className="font-medium">{storageStats.bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ausstehende Aktionen:</span>
                  <span className="font-medium">{storageStats.pendingActions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sync Queue:</span>
                  <span className="font-medium">{storageStats.syncQueue}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          {pendingCount > 0 && isOnline && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="h-8 px-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="h-8 px-2"
          >
            <AlertCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {pendingCount > 0 && !isOnline && (
        <div className="mt-3 p-2 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            Ihre Änderungen werden automatisch synchronisiert, sobald Sie wieder online sind.
          </p>
        </div>
      )}
    </Card>
  );
};

export default OfflineIndicator;
