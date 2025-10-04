// v6 - Fix React imports consistency
import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone, Volume2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NotificationPreferences {
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

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        return;
      }

      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(newPreferences);

      if (error) {
        console.error('Error updating preferences:', error);
        toast.error("Fehler beim Speichern der Einstellungen");
        return;
      }

      toast.success("Einstellungen erfolgreich gespeichert");
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error("Fehler beim Speichern der Einstellungen");
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
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Benachrichtigungseinstellungen
        </h1>
        <p className="text-muted-foreground text-lg">
          Verwalten Sie Ihre Benachrichtigungseinstellungen für {preferences.user_name}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-border p-6 space-y-6">
        {/* Benachrichtigungsarten */}
        <div>
          <h3 className="font-medium mb-4">Benachrichtigungsarten</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium">Popup-Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    Sofortige Benachrichtigungen im Browser
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.toast_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, toast_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-green-500" />
                <div>
                  <div className="font-medium">E-Mail-Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    Benachrichtigungen per E-Mail erhalten
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, email_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-purple-500" />
                <div>
                  <div className="font-medium">Push-Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    Mobile Push-Benachrichtigungen
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.push_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, push_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="font-medium">Ton-Benachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    Akustische Signale bei neuen Benachrichtigungen
                  </div>
                </div>
              </div>
              <Switch
                checked={preferences.sound_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, sound_notifications: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Benachrichtigen bei */}
        <div>
          <h3 className="font-medium mb-4">Benachrichtigen bei</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Neue Aufgaben</div>
                <div className="text-sm text-muted-foreground">
                  Bei neuen Wäscheaufträgen benachrichtigen
                </div>
              </div>
              <Switch
                checked={preferences.notify_new_tasks}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, notify_new_tasks: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Aufgaben-Änderungen</div>
                <div className="text-sm text-muted-foreground">
                  Bei Änderungen an bestehenden Aufträgen
                </div>
              </div>
              <Switch
                checked={preferences.notify_task_changes}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, notify_task_changes: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Status-Updates</div>
                <div className="text-sm text-muted-foreground">
                  Bei Änderungen des Auftragsstatus
                </div>
              </div>
              <Switch
                checked={preferences.notify_status_updates}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, notify_status_updates: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dringende Aufgaben</div>
                <div className="text-sm text-muted-foreground">
                  Bei besonders wichtigen oder dringenden Aufträgen
                </div>
              </div>
              <Switch
                checked={preferences.notify_urgent_tasks}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, notify_urgent_tasks: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={resetSettings}
            className="w-full sm:w-auto"
          >
            Einstellungen zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;