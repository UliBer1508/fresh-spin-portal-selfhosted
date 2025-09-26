import { MapPin, User, Users, Calendar, CalendarCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookingCardProps {
  id: string;
  accommodation: string;
  address: string;
  guest: string;
  guestCount: number;
  checkIn: string;
  checkOut: string;
  status: "pending" | "in-progress" | "completed";
}

const BookingCard = ({ 
  accommodation, 
  address, 
  guest, 
  guestCount, 
  checkIn, 
  checkOut, 
  status 
}: BookingCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "in-progress":
        return "bg-warning text-warning-foreground";
      case "pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Abgeschlossen";
      case "in-progress":
        return "In Bearbeitung";
      case "pending":
        return "Ausstehend";
      default:
        return "Unbekannt";
    }
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
                  Unterkunft: {accommodation}
                </h3>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground ml-7">
                <span className="text-sm">Adresse: {address}</span>
              </div>
            </div>
            <Badge className={getStatusColor(status)}>
              {getStatusText(status)}
            </Badge>
          </div>

          {/* Guest information */}
          <div className="space-y-2 ml-7">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">Gast: {guest}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-foreground">Gäste: {guestCount} Personen</span>
            </div>
          </div>

          {/* Check-in and Check-out dates */}
          <div className="flex items-center space-x-6 ml-7">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-info" />
              <span className="text-foreground">Check-in: {checkIn}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-4 h-4 text-info" />
              <span className="text-foreground">Check-out: {checkOut}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;