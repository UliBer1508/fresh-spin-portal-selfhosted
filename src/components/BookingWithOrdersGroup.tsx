// Group: one BookingCard + counter + N LinenOrderCards
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import BookingCard from "./BookingCard";
import LinenOrderCard from "./LinenOrderCard";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { Booking, LinenOrder } from "@/hooks/useBookings";
import { getGuestName } from '@/lib/guestHelpers';

interface BookingWithOrdersGroupProps {
  booking: Booking;
  orders: LinenOrder[];
  viewSettings: ViewSettings;
  onUpdate?: () => void;
}

const BookingWithOrdersGroup = ({
  booking,
  orders,
  viewSettings,
  onUpdate,
}: BookingWithOrdersGroupProps) => {
  const { t } = useTranslation("orders");

  return (
    <div className="space-y-3">
      <BookingCard booking={booking} viewSettings={viewSettings} onUpdate={onUpdate} />

      {viewSettings.showLinenOrders && orders.length > 1 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-bold">
            {t("labels.linenOrdersForBooking", {
              count: orders.length,
              defaultValue: `${orders.length} Wäschebestellungen zu dieser Bestellung`,
            })}
          </span>
        </div>
      )}

      {viewSettings.showLinenOrders &&
        orders.map((order) => (
          <LinenOrderCard
            key={order.id}
            order={{
              ...order,
              bookings: {
                guest_name: getGuestName(booking),
                check_in: booking.check_in,
                check_out: booking.check_out,
                number_of_guests: booking.number_of_guests,
              },
            }}
            bookingId={booking.id}
            viewSettings={viewSettings}
            onUpdate={onUpdate}
          />
        ))}
    </div>
  );
};

export default BookingWithOrdersGroup;
