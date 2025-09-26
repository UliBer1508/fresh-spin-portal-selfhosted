import { useState, useEffect } from "react";
import { Bell, Volume2, Mail, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const NotificationSettingsDialog = () => {
  const [open, setOpen] = useState(false);
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
    if (open) {
      fetchPreferences();
    }
  }, [open]);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-2">
          <Bell className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Benachrichtigungseinstellungen für {preferences.user_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
                    updatePreferences({ toast_notifications: checked })
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
                    updatePreferences({ email_notifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-purple-500" />
                  <div>
                    <div className="font-medium">Push-Benachrichtigungen</div>
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
                <div className="flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-orange-500" />
                  <div>
                    <div className="font-medium">Soundbenachrichtigungen</div>
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
          <div>
            <h3 className="font-medium mb-4">Benachrichtigen bei</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <div className="font-medium">Neue Reinigungsaufträge</div>
                    <div className="text-sm text-muted-foreground">
                      Wenn ein neuer Auftrag erstellt wird
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
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div>
                    <div className="font-medium">Auftragsänderungen</div>
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
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <div className="font-medium">Statusänderungen</div>
                    <div className="text-sm text-muted-foreground">
                      Wenn ein Auftrag abgeschlossen oder storniert wird
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
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="font-medium">Dringende Aufträge</div>
                    <div className="text-sm text-muted-foreground">
                      Aufträge die heute oder morgen stattfinden
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
          <div className="flex justify-center pt-4 border-t">
            <Button variant="outline" onClick={resetSettings}>
              Einstellungen zurücksetzen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettingsDialog;