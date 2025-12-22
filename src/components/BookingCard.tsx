// v7 - Zentrale Konstanten verwenden
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LinenOrderSection from "./LinenOrderSection";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { Booking } from "@/hooks/useBookings";
import { BOOKING_COLORS, getColorByHash } from "@/lib/constants";

interface BookingCardProps {
  booking: Booking;
  viewSettings: ViewSettings;
  onUpdate?: () => void;
}

const BookingCard = ({ booking, viewSettings, onUpdate }: BookingCardProps) => {
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
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "Bestätigt";
      case "cancelled":
        return "Storniert";
      case "pending":
        return "Ausstehend";
      default:
        return status || "Unbekannt";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
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
                        {booking.houses?.name || 'Unbekannt'}
                      </h3>
                    </div>
                  )}
                  {viewSettings.showAccommodationAddress && (
                  <div className="flex items-center space-x-2 text-muted-foreground ml-3 sm:ml-7">
                    <span className="text-sm">Adresse: {booking.houses?.address || 'Keine Adresse'}</span>
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
                  <span className="text-foreground font-medium">Gast: {booking.guest_name}</span>
                </div>
              )}
              {viewSettings.showGuestCount && (
                <div className="flex items-center space-x-2">
                  <span className="text-base">👥</span>
                  <span className="text-foreground">Gäste: {booking.number_of_guests} Personen</span>
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
                  <span className="text-foreground">Check-in: {formatDate(booking.check_in)}</span>
                </div>
              )}
              {viewSettings.showCheckOutDate && (
                <div className="flex items-center space-x-2">
                  <span className="text-base">📅</span>
                  <span className="text-foreground">Check-out: {formatDate(booking.check_out)}</span>
                </div>
              )}
            </div>
          )}

          {/* Reinigungsdatum */}
          {booking.service_tasks?.find(t => t.service_type === 'cleaning') && (
            <div className="flex items-center space-x-2 ml-3 sm:ml-7">
              <span className="text-base">🧹</span>
              <span className="text-foreground">
                Reinigung am: {formatDate(booking.service_tasks.find(t => t.service_type === 'cleaning')!.scheduled_date)}
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