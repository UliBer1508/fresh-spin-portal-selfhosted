import { useState, useEffect } from "react";
import { ArrowLeft, Bell, Mail, Smartphone, Volume2, Package, Edit, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NotificationPrefs {
  id?: string;
  toast_notifications: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sound_notifications: boolean;
  notify_new_tasks: boolean;
  notify_task_changes: boolean;
  notify_status_updates: boolean;
  notify_urgent_tasks: boolean;
  user_name: string;
  email_address?: string;
}

interface NotificationSettingsProps {
  onBack: () => void;
}

const NotificationSettings = ({ onBack }: NotificationSettingsProps) => {
  console.log("NotificationSettings component rendered"); // Debug log
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    toast_notifications: true,
    email_notifications: false,
    push_notifications: true,
    sound_notifications: true,
    notify_new_tasks: true,
    notify_task_changes: true,
    notify_status_updates: true,
    notify_urgent_tasks: true,
    user_name: 'Amela',
    email_address: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotificationPreferences();
  }, []);

  const fetchNotificationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching preferences:', error);
        toast({
          title: "Fehler",
          description: "Einstellungen konnten nicht geladen werden.",
          variant: "destructive",
        });
      } else if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPrefs, value: boolean) => {
    const updatedPrefs = { ...preferences, [key]: value };
    setPreferences(updatedPrefs);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          id: preferences.id || undefined,
          ...updatedPrefs
        });

      if (error) {
        console.error('Error updating preferences:', error);
        toast({
          title: "Fehler",
          description: "Einstellung konnte nicht gespeichert werden.",
          variant: "destructive",
        });
        // Revert the change
        setPreferences(preferences);
      } else {
        toast({
          title: "Gespeichert",
          description: "Einstellung wurde aktualisiert.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setPreferences(preferences);
    }
  };

  const resetSettings = async () => {
    const defaultPrefs: NotificationPrefs = {
      toast_notifications: true,
      email_notifications: false,
      push_notifications: true,
      sound_notifications: true,
      notify_new_tasks: true,
      notify_task_changes: true,
      notify_status_updates: true,
      notify_urgent_tasks: true,
      user_name: 'Amela',
      email_address: preferences.email_address
    };

    setPreferences(defaultPrefs);

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          id: preferences.id || undefined,
          ...defaultPrefs
        });

      if (error) {
        console.error('Error resetting preferences:', error);
        toast({
          title: "Fehler",
          description: "Einstellungen konnten nicht zurückgesetzt werden.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Zurückgesetzt",
          description: "Alle Einstellungen wurden auf Standard zurückgesetzt.",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    console.log("NotificationSettings is loading..."); // Debug log
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Lade Einstellungen...</p>
      </div>
    );
  }

  console.log("NotificationSettings preferences:", preferences); // Debug log

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          Benachrichtigungseinstellungen
        </h1>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Zurück zu Putzkräfte</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Benachrichtigungseinstellungen für {preferences.user_name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Notification Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Benachrichtigungsarten</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Popup-Benachrichtigungen</div>
                    <div className="text-sm text-muted-foreground">
                      Sofortige Benachrichtigungen im Browser
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.toast_notifications}
                  onCheckedChange={(checked) => updatePreference('toast_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">E-Mail-Benachrichtigungen</div>
                    <div className="text-sm text-muted-foreground">
                      Benachrichtigungen per E-Mail erhalten
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">Push-Benachrichtigungen</div>
                    <div className="text-sm text-muted-foreground">
                      Browser-Push-Benachrichtigungen
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.push_notifications}
                  onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Volume2 className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium">Soundbenachrichtigungen</div>
                    <div className="text-sm text-muted-foreground">
                      Ton bei neuen Benachrichtigungen
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.sound_notifications}
                  onCheckedChange={(checked) => updatePreference('sound_notifications', checked)}
                />
              </div>
            </div>
          </div>

          {/* Event Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Benachrichtigen bei</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Neue Reinigungsaufträge</div>
                    <div className="text-sm text-muted-foreground">
                      Wenn ein neuer Auftrag erstellt wird
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.notify_new_tasks}
                  onCheckedChange={(checked) => updatePreference('notify_new_tasks', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Edit className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium">Auftragsänderungen</div>
                    <div className="text-sm text-muted-foreground">
                      Datum, Zeit oder Details wurden geändert
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.notify_task_changes}
                  onCheckedChange={(checked) => updatePreference('notify_task_changes', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Statusänderungen</div>
                    <div className="text-sm text-muted-foreground">
                      Wenn ein Auftrag abgeschlossen oder storniert wird
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.notify_status_updates}
                  onCheckedChange={(checked) => updatePreference('notify_status_updates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium">Dringende Aufträge</div>
                    <div className="text-sm text-muted-foreground">
                      Aufträge die heute oder morgen stattfinden
                    </div>
                  </div>
                </div>
                <Switch
                  checked={preferences.notify_urgent_tasks}
                  onCheckedChange={(checked) => updatePreference('notify_urgent_tasks', checked)}
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={resetSettings}
              className="w-full"
            >
              Einstellungen zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;