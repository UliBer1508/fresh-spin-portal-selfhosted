import { useState, useEffect } from "react";
import { Bell, Volume2, Mail, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NotificationPreferences {
  id?: string;
  user_name: string;
  email_address: string | null;
  toast_notifications: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sound_notifications: boolean;
  notify_new_tasks: boolean;
  notify_task_changes: boolean;
  notify_status_updates: boolean;
  notify_urgent_tasks: boolean;
}

const NotificationSettings = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    user_name: "Amela",
    email_address: null,
    toast_notifications: true,
    email_notifications: false,
    push_notifications: true,
    sound_notifications: true,
    notify_new_tasks: true,
    notify_task_changes: true,
    notify_status_updates: true,
    notify_urgent_tasks: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      const { error } = await supabase
        .from('notification_preferences')
        .upsert(updatedPreferences);

      if (error) throw error;

      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre Benachrichtigungseinstellungen wurden aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern der Einstellungen.",
        variant: "destructive",
      });
    }
  };

  const resetSettings = async () => {
    const defaultPreferences: NotificationPreferences = {
      user_name: "Amela",
      email_address: null,
      toast_notifications: true,
      email_notifications: false,
      push_notifications: true,
      sound_notifications: true,
      notify_new_tasks: true,
      notify_task_changes: true,
      notify_status_updates: true,
      notify_urgent_tasks: true,
    };

    await updatePreferences(defaultPreferences);
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" />
          Benachrichtigungseinstellungen für {preferences.user_name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Verwalten Sie Ihre Benachrichtigungseinstellungen für Wäschebestellungen
        </p>
      </div>

      <div className="grid gap-8 max-w-4xl">
        {/* Benachrichtigungsarten */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-xl font-semibold mb-6">Benachrichtigungsarten</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium text-lg">Popup-Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    Sofortige Benachrichtigungen im Browser
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.toast_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ toast_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium text-lg">E-Mail-Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    Benachrichtigungen per E-Mail erhalten
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ email_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Smartphone className="w-5 h-5 text-purple-500" />
                <div>
                  <div className="font-medium text-lg">Push-Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    Browser-Push-Benachrichtigungen
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.push_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ push_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Volume2 className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="font-medium text-lg">Soundbenachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    Ton bei neuen Benachrichtigungen
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.sound_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ sound_notifications: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Benachrichtigen bei */}
        <div className="bg-card rounded-lg border p-6">
          <h3 className="text-xl font-semibold mb-6">Benachrichtigen bei</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div>
                  <div className="font-medium text-lg">Neue Wäschebestellungen</div>
                  <div className="text-sm text-muted-foreground">
                    Wenn eine neue Bestellung erstellt wird
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.notify_new_tasks}
                onCheckedChange={(checked) =>
                  updatePreferences({ notify_new_tasks: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <div>
                  <div className="font-medium text-lg">Bestellungsänderungen</div>
                  <div className="text-sm text-muted-foreground">
                    Datum, Zeit oder Details wurden geändert
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.notify_task_changes}
                onCheckedChange={(checked) =>
                  updatePreferences({ notify_task_changes: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <div className="font-medium text-lg">Lieferstatus-Änderungen</div>
                  <div className="text-sm text-muted-foreground">
                    Wenn eine Bestellung geliefert oder storniert wird
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.notify_status_updates}
                onCheckedChange={(checked) =>
                  updatePreferences({ notify_status_updates: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-medium text-lg">Dringende Bestellungen</div>
                  <div className="text-sm text-muted-foreground">
                    Bestellungen die heute oder morgen geliefert werden
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.notify_urgent_tasks}
                onCheckedChange={(checked) =>
                  updatePreferences({ notify_urgent_tasks: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={resetSettings} className="px-8">
            Einstellungen zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;