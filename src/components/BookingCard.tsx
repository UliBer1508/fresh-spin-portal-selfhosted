// v9 - Passende Reinigung pro Wäschebestellung
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LinenOrderSection from "./LinenOrderSection";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { Booking } from "@/hooks/useBookings";
import { BOOKING_COLORS, getColorByHash } from "@/lib/constants";
import { useTranslation } from "react-i18next";

interface BookingCardProps {
  booking: Booking;
  viewSettings: ViewSettings;
  onUpdate?: () => void;
}

const BookingCard = ({ booking, viewSettings, onUpdate }: BookingCardProps) => {
  const { t, i18n } = useTranslation(['common', 'bookings']);

  // Finde die passende Reinigung basierend auf dem Lieferdatum der aktuellen Wäschebestellung
  const matchingCleaning = useMemo(() => {
    const cleaningTasks = booking.service_tasks?.filter(task => task.service_type === 'cleaning') || [];
    if (cleaningTasks.length === 0) return null;
    if (cleaningTasks.length === 1) return cleaningTasks[0];

    const currentOrder = booking.linen_orders?.[0];
    if (!currentOrder?.delivery_date) return cleaningTasks[0];

    const deliveryDate = new Date(currentOrder.delivery_date).getTime();

    // Finde die Reinigung mit geringstem Abstand zum Lieferdatum
    return cleaningTasks.reduce((closest, task) => {
      const taskDiff = Math.abs(deliveryDate - new Date(task.scheduled_date).getTime());
      const closestDiff = Math.abs(deliveryDate - new Date(closest.scheduled_date).getTime());
      return taskDiff < closestDiff ? task : closest;
    });
  }, [booking.service_tasks, booking.linen_orders]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "bg-success text-success-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || 'unknown';
    return t(`bookings:status.${normalizedStatus}`, { defaultValue: status || t('common:unknown') });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language);
  };

  const getBookingColor = (bookingId: string) => {
    return getColorByHash(BOOKING_COLORS, bookingId);
  };

  return (
    <Card className={`w-full hover:shadow-md transition-shadow border-border bg-yellow-50 border-l-8 ${getBookingColor(booking.id)}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with accommodation and status */}
          {(viewSettings.showAccommodationName || viewSettings.showAccommodationAddress || viewSettings.showBookingStatus) && (
            <div className="flex items-start justify-between">
              {(viewSettings.showAccommodationName || viewSettings.showAccommodationAddress) && (
                <div className="space-y-1">
                  {viewSettings.showAccommodationName && (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📍</span>
                      <h3 className="font-semibold text-lg text-foreground">
                        {booking.houses?.name || t('common:unknown')}
                      </h3>
                    </div>
                  )}
                  {viewSettings.showAccommodationAddress && (
                  <div className="flex items-center space-x-2 text-muted-foreground ml-3 sm:ml-7">
                    <span className="text-sm">{booking.houses?.address || t('common:noAddress')}</span>
                  </div>
                  )}
                </div>
              )}
              {viewSettings.showBookingStatus && (
                <Badge className={getStatusColor(booking.status)}>
                  {getStatusText(booking.status)}
                </Badge>
              )}
            </div>
          )}

          {/* Guest information */}
          {(viewSettings.showGuestName || viewSettings.showGuestCount) && (
            <div className="space-y-2 ml-3 sm:ml-7">
              {viewSettings.showGuestName && (
                <div className="flex items-center space-x-2">
                  <span className="text-base">👤</span>
                  <span className="text-foreground font-medium">{t('common:guests.guest')}: {booking.guest_name}</span>
                </div>
              )}
              {viewSettings.showGuestCount && (
                <div className="flex items-center space-x-2">
                  <span className="text-base">👥</span>
                  <span className="text-foreground">{t('common:guests.guests')}: {booking.number_of_guests} {t('common:guests.persons')}</span>
                </div>
              )}
            </div>
          )}

          {/* Check-in and Check-out dates */}
          {(viewSettings.showCheckInDate || viewSettings.showCheckOutDate) && (
            <div className="flex flex-col space-y-2 ml-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6 sm:ml-7">
              {viewSettings.showCheckInDate && (
                <div className="flex items-center space-x-2">
                  <span className="text-base">📅</span>
                  <span className="text-foreground">{t('common:dates.checkIn')}: {formatDate(booking.check_in)}</span>
                </div>
              )}
              {viewSettings.showCheckOutDate && (
                <div className="flex items-center space-x-2">
                  <span className="text-base">📅</span>
                  <span className="text-foreground">{t('common:dates.checkOut')}: {formatDate(booking.check_out)}</span>
                </div>
              )}
            </div>
          )}

          {/* Reinigungsdatum - passend zur aktuellen Wäschebestellung */}
          {matchingCleaning && (
            <div className="flex items-center space-x-2 ml-3 sm:ml-7">
              <span className="text-base">🧹</span>
              <span className="text-foreground">
                {t('common:dates.cleaningDate')}: {formatDate(matchingCleaning.scheduled_date)}
              </span>
            </div>
          )}

          {/* Linen Orders Section */}
          {viewSettings.showLinenOrders && (
            <LinenOrderSection 
              linenOrders={(booking.linen_orders || []).map(order => ({
                ...order,
                bookings: {
                  guest_name: booking.guest_name,
                  check_in: booking.check_in,
                  check_out: booking.check_out,
                  number_of_guests: booking.number_of_guests
                }
              }))} 
              onUpdate={onUpdate}
              viewSettings={viewSettings}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
