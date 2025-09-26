import { MapPin, User, Users, Calendar, CalendarCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LinenOrderSection from "./LinenOrderSection";
import { Booking } from "@/hooks/useBookings";

interface BookingCardProps {
  booking: Booking;
}

const BookingCard = ({ booking }: BookingCardProps) => {
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

  return (
    <Card className="w-full hover:shadow-md transition-shadow border-border">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with accommodation and status */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg text-foreground">
                  Unterkunft: {booking.houses?.name || 'Unbekannt'}
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground ml-7">
                <span className="text-sm">Adresse: {booking.houses?.address || 'Keine Adresse'}</span>
              </div>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {getStatusText(booking.status)}
            </Badge>
          </div>

          {/* Guest information */}
          <div className="space-y-2 ml-7">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">Gast: {booking.guest_name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-foreground">Gäste: {booking.number_of_guests} Personen</span>
            </div>
          </div>

          {/* Check-in and Check-out dates */}
          <div className="flex items-center space-x-6 ml-7">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-info" />
              <span className="text-foreground">Check-in: {formatDate(booking.check_in)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-info" />
              <span className="text-foreground">Check-out: {formatDate(booking.check_out)}</span>
            </div>
          </div>

          {/* Linen Orders Section */}
          <LinenOrderSection linenOrders={booking.linen_orders || []} />
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;