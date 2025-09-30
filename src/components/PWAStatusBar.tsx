import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';

const PWAStatusBar = () => {
  const { isOnline, isInstalled } = usePWA();

  if (!isInstalled && isOnline) {
    return null; // Only show status bar when installed or offline
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isInstalled && (
              <Badge variant="secondary" className="text-xs">
                PWA Modus
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <div className="flex items-center space-x-1 text-success">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium">Online</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-destructive">
                <WifiOff className="w-4 h-4" />
                <span className="text-xs font-medium">Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAStatusBar;