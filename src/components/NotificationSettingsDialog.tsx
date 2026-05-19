// Simple popup for notification on/off + days in advance
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const NotificationSettingsDialog = ({ open, onOpenChange }: Props) => {
  const [enabled, setEnabled] = useState(true);
  const [days, setDays] = useState(3);
  const [rowId, setRowId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (data) {
        setRowId(data.id);
        setEnabled((data as any).notifications_enabled ?? true);
        setDays((data as any).notify_days_in_advance ?? 3);
      }
    })();
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        notifications_enabled: enabled,
        notify_days_in_advance: days,
      };
      if (rowId) payload.id = rowId;
      const { error } = await supabase
        .from("notification_preferences")
        .upsert(payload);
      if (error) throw error;
      toast.success("Einstellungen gespeichert");
      onOpenChange(false);
    } catch (e) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[88vw] max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>🔔 Benachrichtigungen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-enabled" className="text-base">
              Benachrichtigungen aktiv
            </Label>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base">Tage im Voraus benachrichtigen</Label>
            <Select
              value={String(days)}
              onValueChange={(v) => setDays(Number(v))}
            >
              <SelectTrigger className="text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 7, 10, 14].map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} {d === 1 ? "Tag" : "Tage"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Speichert…" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettingsDialog;
