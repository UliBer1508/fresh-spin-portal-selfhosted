// v11 - Auto-update with countdown
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { usePWA } from '@/hooks/usePWA';
import { RefreshCw } from 'lucide-react';

const PWAUpdatePrompt = () => {
  const { updateAvailable, applyUpdate } = usePWA();
  const [countdown, setCountdown] = useState(5);
  const toastIdRef = useRef<string | number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (updateAvailable && countdown === 5) {
      console.log('[PWA] Update available, starting countdown');
      
      toastIdRef.current = toast('Update wird installiert...', {
        description: `Automatisches Update in ${countdown} Sekunden`,
        duration: Infinity,
        icon: <RefreshCw className="w-4 h-4" />,
        action: {
          label: 'Jetzt updaten',
          onClick: () => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            applyUpdate();
          }
        }
      });

      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          const newCount = prev - 1;
          
          if (newCount > 0) {
            toast.dismiss(toastIdRef.current!);
            toastIdRef.current = toast('Update wird installiert...', {
              description: `Automatisches Update in ${newCount} Sekunden`,
              duration: Infinity,
              icon: <RefreshCw className="w-4 h-4" />,
              action: {
                label: 'Jetzt updaten',
                onClick: () => {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                  }
                  applyUpdate();
                }
              }
            });
            return newCount;
          } else {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            toast.dismiss(toastIdRef.current!);
            applyUpdate();
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateAvailable, applyUpdate]);

  return null;
};

export default PWAUpdatePrompt;
