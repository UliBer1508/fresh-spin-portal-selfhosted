// Centered popup showing a newly arrived / upcoming linen order
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Booking } from "@/hooks/useBookings";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  booking: Booking | null;
  viewSettings: ViewSettings;
}

const OrderNotificationDialog = ({ open, onOpenChange, booking }: Props) => {
  const order = booking?.linen_orders?.[0];
  const chaletName = booking?.houses?.name ?? "";
  const deliveryDate = order?.delivery_date
    ? format(parseLocalDate(order.delivery_date), "dd.MM.yyyy", { locale: de })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[88vw] max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>Neue Bestellung</DialogTitle>
        </DialogHeader>

        {booking && order ? (
          <p className="text-base text-foreground leading-relaxed">
            Hallo Teuni, es steht eine Bestellung für{" "}
            <strong>„{chaletName}"</strong> für den{" "}
            <strong>{deliveryDate}</strong> an. Vielen Dank
          </p>
        ) : (
          <p className="text-muted-foreground">Keine Bestellung verfügbar.</p>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Bestätigen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderNotificationDialog;
