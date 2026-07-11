// Pflicht-Dialog: muss explizit per Button bestätigt werden.
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { BookingChangeNotification } from "@/hooks/useBookingChangeNotifications";

// Robust gegen reine Datumsstrings ("2026-07-20") UND volle Zeitstempel
// ("2026-07-20T00:00:00+00:00"). Liefert null bei allem, was kein gültiges
// Datum ergibt - so kann format() niemals mit "Invalid time value" abstürzen
// und das ganze Portal lahmlegen.
const parseLocalDate = (s?: string | null): Date | null => {
  if (!s) return null;
  const datePart = String(s).slice(0, 10); // nur der YYYY-MM-DD-Teil
  const [y, m, d] = datePart.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
};

// Sicheres Formatieren: gibt "?" zurück statt zu werfen.
const fmt = (dt: Date | null): string => {
  if (!dt) return "?";
  try {
    return format(dt, "dd.MM.yyyy", { locale: de });
  } catch {
    return "?";
  }
};

// Werte immer als Text rendern - falls versehentlich ein Objekt/eine Zahl in
// old_value/new_value landet, wirft React sonst "Objects are not valid as a
// React child".
const asText = (v: unknown): string => (v == null ? "—" : String(v));

interface Props {
  notification: BookingChangeNotification | null;
  onAcknowledge: () => void;
}

const CHANGE_LABELS: Record<string, string> = {
  guest_count: "Anzahl Gäste",
};

const BookingChangeNotificationDialog = ({ notification, onAcknowledge }: Props) => {
  const open = !!notification;
  const houseName = notification?.booking?.houses?.name ?? "Unbekannt";
  const guest = notification?.booking?.guest_name ?? "";
  const ci = parseLocalDate(notification?.booking?.check_in);
  const co = parseLocalDate(notification?.booking?.check_out);
  const label = notification
    ? String(CHANGE_LABELS[notification.change_type] ?? notification.change_type ?? "")
    : "";

  return (
    <Dialog open={open} onOpenChange={() => { /* nicht schließbar ohne Bestätigung */ }}>
      <DialogContent
        className="w-[90vw] max-w-md rounded-3xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Wichtige Änderung
          </DialogTitle>
        </DialogHeader>

        {notification && (
          <div className="space-y-3 text-base">
            <p>
              Bei der Buchung <strong>„{houseName}"</strong>
              {guest ? <> von <strong>{guest}</strong></> : null} hat sich
              <strong> {label}</strong> geändert:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <span className="text-muted-foreground line-through mr-2">
                {asText(notification.old_value)}
              </span>
              →
              <span className="ml-2 text-lg font-bold text-amber-700">
                {asText(notification.new_value)}
              </span>
            </div>
            {(ci || co) && (
              <p className="text-sm text-muted-foreground">
                Aufenthalt: {fmt(ci)}{" – "}{fmt(co)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Bitte berücksichtige dies bei der nächsten Lieferung.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onAcknowledge} className="w-full" size="lg">
            ✓ Verstanden – Bestätigen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingChangeNotificationDialog;
