// v6 - Fix React imports consistency
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallPrompt = () => {
  const { isInstallable, installApp, isInstalled } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt after 30 seconds if app is installable and not already installed
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled]);

  if (!showPrompt || !isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="bg-primary text-primary-foreground shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">
                Wäscheportal installieren
              </h3>
              <p className="text-sm opacity-90 mt-1">
                Installieren Sie die App für schnelleren Zugriff und Offline-Funktionen.
              </p>
              <div className="flex space-x-2 mt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleInstall}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Installieren
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Später
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 hover:bg-primary-foreground/10 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;