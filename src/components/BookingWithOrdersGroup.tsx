// Group: one BookingCard + counter + N LinenOrderCards
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import BookingCard from "./BookingCard";
import LinenOrderCard from "./LinenOrderCard";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { Booking, LinenOrder } from "@/hooks/useBookings";

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

      {viewSettings.showLinenOrders && orders.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
            <Sparkles className="w-4 h-4" />
            <span>
              {t("labels.linenOrdersForBooking", {
                count: orders.length,
                defaultValue:
                  orders.length === 1
                    ? "1 Wäschebestellung zu dieser Buchung"
                    : `${orders.length} Wäschebestellungen zu dieser Buchung`,
              })}
            </span>
          </div>

          {orders.map((order) => (
            <LinenOrderCard
              key={order.id}
              order={{
                ...order,
                bookings: {
                  guest_name: booking.guest_name,
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
        </>
      )}
    </div>
  );
};

export default BookingWithOrdersGroup;
