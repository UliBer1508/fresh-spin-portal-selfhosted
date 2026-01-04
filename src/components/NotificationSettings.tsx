// v7 - Multi-language support
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('notifications');
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
        toast.error(t('common:error'));
        return;
      }

      toast.success(t('common:success'));
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(t('common:error'));
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
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center md:text-left px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {preferences.user_name}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Benachrichtigungsarten */}
        <div>
          <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">{t('settings.types')}</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Bell className="w-5 h-5 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base">{t('channels.toast')}</div>
                </div>
              </div>
              <Switch
                checked={preferences.toast_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, toast_notifications: checked })
                }
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Mail className="w-5 h-5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base">{t('channels.email')}</div>
                </div>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, email_notifications: checked })
                }
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Smartphone className="w-5 h-5 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base">{t('channels.push')}</div>
                </div>
              </div>
              <Switch
                checked={preferences.push_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, push_notifications: checked })
                }
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Volume2 className="w-5 h-5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base">{t('channels.sound')}</div>
                </div>
              </div>
              <Switch
                checked={preferences.sound_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, sound_notifications: checked })
                }
                className="flex-shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Benachrichtigen bei */}
        <div>
          <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">{t('settings.when')}</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm sm:text-base">{t('triggers.newTasks')}</div>
              </div>
              <Switch
                checked={preferences.notify_new_tasks}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, notify_new_tasks: checked })
                }
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm sm:text-base">{t('triggers.taskChanges')}</div>
              </div>
              <Switch
                checked={preferences.notify_task_changes}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, notify_task_changes: checked })
                }
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm sm:text-base">{t('triggers.statusUpdates')}</div>
              </div>
              <Switch
                checked={preferences.notify_status_updates}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, notify_status_updates: checked })
                }
                className="flex-shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-sm sm:text-base">{t('triggers.urgentTasks')}</div>
              </div>
              <Switch
                checked={preferences.notify_urgent_tasks}
                onCheckedChange={(checked) =>
                  updatePreferences({ ...preferences, notify_urgent_tasks: checked })
                }
                className="flex-shrink-0"
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
            {t('common:actions.reset')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
