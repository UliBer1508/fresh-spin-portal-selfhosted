// v6 - Fix React imports consistency
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePWA } from '@/hooks/usePWA';
import { RefreshCw } from 'lucide-react';

const PWAUpdatePrompt = () => {
  const { updateAvailable, applyUpdate } = usePWA();

  useEffect(() => {
    if (updateAvailable) {
      toast('Neue Version verfügbar', {
        description: 'Eine neue Version der App ist verfügbar. Jetzt aktualisieren?',
        duration: Infinity,
        action: {
          label: 'Aktualisieren',
          onClick: () => applyUpdate()
        },
        icon: <RefreshCw className="w-4 h-4" />
      });
    }
  }, [updateAvailable, applyUpdate]);

  return null;
};

export default PWAUpdatePrompt;
