import { Calendar, Clock, User, Package, FileText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinenOrder } from "@/hooks/useBookings";

interface LinenOrderSectionProps {
  linenOrders: LinenOrder[];
}

const LinenOrderSection = ({ linenOrders }: LinenOrderSectionProps) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "geliefert":
      case "completed":
        return "bg-success text-success-foreground";
      case "in_progress":
      case "assigned":
        return "bg-warning text-warning-foreground";
      case "pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "geliefert":
      case "completed":
        return "Geliefert";
      case "in_progress":
      case "assigned":
        return "In Bearbeitung";
      case "pending":
        return "Ausstehend";
      default:
        return status || "Unbekannt";
    }
  };

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return "Nicht geplant";
    
    const formattedDate = new Date(date).toLocaleDateString('de-DE');
    if (time) {
      return `${formattedDate} - ${time}`;
    }
    return formattedDate;
  };

  if (!linenOrders || linenOrders.length === 0) {
    return (
      <div className="mt-4 p-4 bg-muted/30 rounded-lg border-l-4 border-l-warning">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-warning" />
          <span className="text-muted-foreground">Keine Wäschebestellung vorhanden</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="border-t border-border pt-4">
        <div className="flex items-center space-x-2 mb-3">
          <Package className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">Wäschebestellung</h4>
        </div>
        
        {linenOrders.map((order) => (
          <div key={order.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {order.service_providers?.name && (
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-info" />
                    <span className="text-sm text-foreground">
                      Provider: <span className="font-medium">{order.service_providers.name}</span>
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-info" />
                  <span className="text-sm text-foreground">
                    Abholung: {formatDateTime(order.delivery_date, order.delivery_time)}
                  </span>
                </div>

                {order.laundry_staff?.name && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-info" />
                    <span className="text-sm text-foreground">
                      Zugewiesen: <span className="font-medium">{order.laundry_staff.name}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Artikel anzeigen
                </Button>
                <Button variant="outline" size="sm">
                  <Clock className="w-4 h-4 mr-1" />
                  Liefertermin bearbeiten
                </Button>
                <Button variant="outline" size="sm">
                  <Package className="w-4 h-4 mr-1" />
                  Wäschenotizen anzeigen
                </Button>
              </div>
            </div>

            {order.notes && (
              <div className="mt-2 p-2 bg-background rounded border-l-4 border-l-info">
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinenOrderSection;