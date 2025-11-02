import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, BellRing, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePWA } from '@/hooks/usePWA';

const PushNotificationSetup = () => {
  const { requestNotificationPermission, showNotification } = usePWA();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('[PushNotification] Error checking subscription:', error);
      }
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      await requestNotificationPermission();
      const newPermission = Notification.permission;
      setPermission(newPermission);

      if (newPermission === 'granted') {
        await subscribeToPush();
        toast.success('Benachrichtigungen aktiviert', {
          description: 'Sie erhalten jetzt Push-Benachrichtigungen',
          icon: <BellRing className="w-4 h-4" />,
        });
      } else if (newPermission === 'denied') {
        toast.error('Benachrichtigungen blockiert', {
          description: 'Bitte aktivieren Sie Benachrichtigungen in den Browser-Einstellungen',
        });
      }
    } catch (error) {
      console.error('[PushNotification] Error enabling notifications:', error);
      toast.error('Fehler beim Aktivieren', {
        description: 'Benachrichtigungen konnten nicht aktiviert werden',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe to push notifications
        // Note: In production, you would use your VAPID public key here
        const vapidKey = urlBase64ToUint8Array(
          // This is a placeholder VAPID key - replace with your actual key
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xQmrNcXmMXS4kC5jdlxDGOv2TJLLgCqxOC6aeRjdWMFmfKJLLFkU0'
        );
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey as BufferSource,
        });

        // In production, send subscription to your backend
        console.log('[PushNotification] Subscription created:', subscription);
        
        // You would typically send this to your backend:
        // await fetch('/api/push-subscription', {
        //   method: 'POST',
        //   body: JSON.stringify(subscription),
        //   headers: { 'Content-Type': 'application/json' }
        // });
      }

      setIsSubscribed(true);
    } catch (error) {
      console.error('[PushNotification] Error subscribing to push:', error);
      throw error;
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          setIsSubscribed(false);
          toast.success('Benachrichtigungen deaktiviert', {
            description: 'Sie erhalten keine Push-Benachrichtigungen mehr',
          });
        }
      }
    } catch (error) {
      console.error('[PushNotification] Error unsubscribing:', error);
      toast.error('Fehler beim Deaktivieren', {
        description: 'Benachrichtigungen konnten nicht deaktiviert werden',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (permission === 'granted') {
      await showNotification('Test-Benachrichtigung', {
        body: 'Dies ist eine Test-Benachrichtigung vom Teuni Wäscheportal',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'test-notification',
      });
      toast.success('Test-Benachrichtigung gesendet');
    }
  };

  if (!('Notification' in window)) {
    return null; // Browser doesn't support notifications
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Push-Benachrichtigungen</CardTitle>
          </div>
          
          <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
            {permission === 'granted' && <Check className="w-3 h-3 mr-1" />}
            {permission === 'denied' && <X className="w-3 h-3 mr-1" />}
            {permission === 'granted' ? 'Aktiviert' : permission === 'denied' ? 'Blockiert' : 'Inaktiv'}
          </Badge>
        </div>
        <CardDescription>
          Erhalten Sie Benachrichtigungen über neue Buchungen und wichtige Updates
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {permission === 'default' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Aktivieren Sie Push-Benachrichtigungen, um über neue Wäschebestellungen und wichtige Updates informiert zu werden.
            </p>
            <Button 
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="w-full"
            >
              <BellRing className="w-4 h-4 mr-2" />
              Benachrichtigungen aktivieren
            </Button>
          </div>
        )}

        {permission === 'granted' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>
                Benachrichtigungen sind aktiviert
                {isSubscribed && ' und abonniert'}
              </span>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleTestNotification}
                className="flex-1"
              >
                <Bell className="w-4 h-4 mr-2" />
                Test senden
              </Button>

              <Button 
                variant="outline"
                onClick={handleUnsubscribe}
                disabled={isLoading || !isSubscribed}
                className="flex-1"
              >
                <BellOff className="w-4 h-4 mr-2" />
                Deaktivieren
              </Button>
            </div>
          </div>
        )}

        {permission === 'denied' && (
          <div className="space-y-3">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive flex items-start gap-2">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Benachrichtigungen wurden blockiert. Bitte aktivieren Sie diese in Ihren Browser-Einstellungen:
                  <br />
                  <strong>Einstellungen → Datenschutz → Benachrichtigungen</strong>
                </span>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default PushNotificationSetup;
