// Centered popup showing a newly arrived / upcoming linen order
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LinenOrderCard from "./LinenOrderCard";
import { Booking } from "@/hooks/useBookings";
import { ViewSettings } from "@/components/ViewSettingsDialog";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  booking: Booking | null;
  viewSettings: ViewSettings;
}

const OrderNotificationDialog = ({ open, onOpenChange, booking, viewSettings }: Props) => {
  const order = booking?.linen_orders?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🔔 Neue Wäschebestellung</DialogTitle>
        </DialogHeader>

        {booking && order ? (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {booking.houses?.name} · Gast: {booking.guest_name}
            </div>
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
