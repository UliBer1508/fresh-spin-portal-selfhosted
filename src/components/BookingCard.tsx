// v6 - Fix React imports consistency
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LinenOrderSection from "./LinenOrderSection";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { Booking } from "@/hooks/useBookings";
// v3 - Emojis vollständig implementiert

// Farb-Palette für Buchungsrand
const BOOKING_COLORS = [
  'border-blue-500',
  'border-purple-500',
  'border-pink-500',
  'border-green-500',
  'border-orange-500',
  'border-teal-500',
  'border-indigo-500',
  'border-rose-500',
  'border-cyan-500',
  'border-amber-500',
  'border-emerald-500',
  'border-violet-500',
];

interface BookingCardProps {
  booking: Booking;
  viewSettings: ViewSettings;
}

const BookingCard = ({ booking, viewSettings }: BookingCardProps) => {
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
    // Einfacher Hash basierend auf der ID
    const hash = bookingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % BOOKING_COLORS.length;
    return BOOKING_COLORS[index];
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
              linenOrders={booking.linen_orders || []} 
              onUpdate={() => window.location.reload()}
              viewSettings={viewSettings}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;