// v7 - Only show when offline or update available
import { WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';

const PWAStatusBar = () => {
  const { isOnline, updateAvailable } = usePWA();

  // Only show when offline or when an update is available
  if (isOnline && !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {updateAvailable && (
              <Badge variant="default" className="text-xs animate-pulse">
                Aktualisiere...
              </Badge>
            )}
          </div>

          {!isOnline && (
            <div className="flex items-center space-x-1 text-destructive">
              <WifiOff className="w-4 h-4" />
              <span className="text-xs font-medium">Offline</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAStatusBar;
