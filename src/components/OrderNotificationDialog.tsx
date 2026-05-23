// Centered popup showing a newly arrived / upcoming linen order
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LinenOrderCard from "./LinenOrderCard";
import { Booking } from "@/hooks/useBookings";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { parseLocalDate } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  booking: Booking | null;
  viewSettings: ViewSettings;
}

const OrderNotificationDialog = ({ open, onOpenChange, booking, viewSettings }: Props) => {
  const order = booking?.linen_orders?.[0];
  const chaletName = booking?.houses?.name ?? "";
  const deliveryDate = order?.delivery_date
    ? format(parseLocalDate(order.delivery_date), "dd.MM.yyyy", { locale: de })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[88vw] max-w-sm rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🔔 Neue Wäschebestellung</DialogTitle>
        </DialogHeader>

        {booking && order ? (
          <div className="space-y-3">
            <p className="text-base font-medium text-foreground leading-relaxed">
              Hallo Teuni, es gibt eine offene Bestellung für{" "}
              <strong>„{chaletName}"</strong> für den{" "}
              <strong>{deliveryDate}</strong>.
            </p>
            <LinenOrderCard
              order={order}
              bookingId={booking.id}
              viewSettings={viewSettings}
            />
          </div>
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
