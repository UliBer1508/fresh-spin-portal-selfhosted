// v10 - New layout matching reference: icon tile, address row, guest row, check-in/out subcards
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Users, Calendar, Sparkles } from "lucide-react";

import { ViewSettings } from "@/components/ViewSettingsDialog";
import { Booking } from "@/hooks/useBookings";
import { BOOKING_COLORS, getColorByHash } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { getGuestName } from '@/lib/guestHelpers';

interface BookingCardProps {
  booking: Booking;
  viewSettings: ViewSettings;
  onUpdate?: () => void;
}

const BookingCard = ({ booking, viewSettings, onUpdate }: BookingCardProps) => {
  const { t, i18n } = useTranslation(["common", "bookings"]);

  const matchingCleaning = useMemo(() => {
    const cleaningTasks =
      booking.service_tasks?.filter((task) => task.service_type === "cleaning") || [];
    if (cleaningTasks.length === 0) return null;
    if (cleaningTasks.length === 1) return cleaningTasks[0];
    const currentOrder = booking.linen_orders?.[0];
    if (!currentOrder?.delivery_date) return cleaningTasks[0];
    const deliveryDate = new Date(currentOrder.delivery_date).getTime();
    return cleaningTasks.reduce((closest, task) => {
      const taskDiff = Math.abs(deliveryDate - new Date(task.scheduled_date).getTime());
      const closestDiff = Math.abs(deliveryDate - new Date(closest.scheduled_date).getTime());
      return taskDiff < closestDiff ? task : closest;
    });
  }, [booking.service_tasks, booking.linen_orders]);

   // „Eingescheckt" = echter Buchungsstatus aus der Hausverwaltung,
  // nicht aus dem Datum abgeleitet.
  const isCheckedIn = (booking.status || "").toLowerCase() === "checked_in";

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(i18n.language);

  const getBookingColor = (bookingId: string) =>
    getColorByHash(BOOKING_COLORS, bookingId);

  return (
    <Card
      className={`w-full hover:shadow-md transition-shadow border-border bg-yellow-50 border-l-4 ${getBookingColor(
        booking.id,
      )}`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2.5">
          {/* Header: icon tile + house name + booking subtitle + status */}
          {(viewSettings.showAccommodationName || isCheckedIn) && (
            <div className="flex items-start justify-between gap-3">
              {viewSettings.showAccommodationName ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 p-0.5">
                    <img src="/steinbock-logo.png" alt="Steinbock Chalets" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground truncate leading-tight">
                      {booking.houses?.name || t("common:unknown")}
                    </h3>
                    <p className="text-muted-foreground leading-tight text-sm font-bold">
                      {t("bookings:labels.booking", { defaultValue: "Buchung" })}
                    </p>
                  </div>
                </div>
              ) : <div />}
              {isCheckedIn && (
                <Badge className="bg-success text-success-foreground">
                  {t("bookings:status.checkedIn", { defaultValue: "Eingescheckt" })}
                </Badge>
              )}
            </div>
          )}

          {/* Address */}
          {viewSettings.showAccommodationAddress && booking.houses?.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="text-sm truncate">{booking.houses.address}</span>
            </div>
          )}

          {/* Guest + count row */}
          {(viewSettings.showGuestName || viewSettings.showGuestCount) && (
            <div className="flex items-center gap-3 flex-wrap">
              {viewSettings.showGuestName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-foreground" />
                  <span className="font-semibold text-foreground text-sm">
                    {getGuestName(booking)}
                  </span>
                </div>
              )}
              {viewSettings.showGuestName && viewSettings.showGuestCount && (
                <span className="text-muted-foreground">·</span>
              )}
              {viewSettings.showGuestCount && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-foreground" />
                  <span className="font-semibold text-foreground text-sm">
                    {booking.number_of_guests}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Check-in / Check-out subcards */}
          {(viewSettings.showCheckInDate || viewSettings.showCheckOutDate) && (
            <div className="grid grid-cols-2 gap-2">
              {viewSettings.showCheckInDate && (
                <div className="rounded-lg border border-border bg-transparent p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold uppercase tracking-wide text-muted-foreground text-sm">
                      {t("common:dates.checkIn")}
                    </span>
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {formatDate(booking.check_in)}
                  </div>
                </div>
              )}
              {viewSettings.showCheckOutDate && (
                <div className="rounded-lg border border-border bg-transparent p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <span className="font-semibold uppercase tracking-wide text-muted-foreground text-sm">
                      {t("common:dates.checkOut")}
                    </span>
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {formatDate(booking.check_out)}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Cleaning date */}
          {matchingCleaning && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground text-sm font-bold">
                {t("common:dates.cleaningDate")}: {formatDate(matchingCleaning.scheduled_date)}
              </span>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;

