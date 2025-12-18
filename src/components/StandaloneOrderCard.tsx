import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Home, Truck, User, Edit2 } from "lucide-react";
import { LinenOrder } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DeliveryDateDialog from "@/components/dialogs/DeliveryDateDialog";
import LinenNotesDialog from "@/components/dialogs/LinenNotesDialog";
import { LINEN_LABELS, LINEN_ORDER, LINEN_COLOR_LABELS } from "@/lib/linenLabels";

interface LaundryStaff {
  id: string;
  name: string;
}

interface StandaloneOrderCardProps {
  order: LinenOrder;
  onUpdate: () => void;
}

const StandaloneOrderCard = ({ order, onUpdate }: StandaloneOrderCardProps) => {
  const [laundryStaff, setLaundryStaff] = useState<LaundryStaff[]>([]);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  useEffect(() => {
    const fetchLaundryStaff = async () => {
      const { data } = await supabase
        .from('laundry_staff')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (data) setLaundryStaff(data);
    };
    fetchLaundryStaff();
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    const { error } = await supabase
      .from('linen_orders')
      .update({ status: newStatus })
      .eq('id', order.id);

    if (error) {
      toast.error('Fehler beim Aktualisieren des Status');
    } else {
      toast.success('Status aktualisiert');
      onUpdate();
    }
  };

  const handleAssignStaff = async (staffId: string) => {
    const { error } = await supabase
      .from('linen_orders')
      .update({ assigned_staff_id: staffId })
      .eq('id', order.id);

    if (error) {
      toast.error('Fehler beim Zuweisen');
    } else {
      toast.success('Mitarbeiter zugewiesen');
      onUpdate();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'in_delivery': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'confirmed': return 'Bestätigt';
      case 'in_delivery': return 'In Lieferung';
      case 'delivered': return 'Geliefert';
      default: return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDeliveryTypeLabel = (type?: string) => {
    switch (type) {
      case 'pickup': return 'Abholung';
      case 'delivery': return 'Lieferung';
      default: return type || '-';
    }
  };

  const getItemColor = (itemKey: string): string => {
    if (order.item_variants && order.item_variants[itemKey]) {
      return LINEN_COLOR_LABELS[order.item_variants[itemKey]] || order.item_variants[itemKey];
    }
    if (order.linen_color) {
      return LINEN_COLOR_LABELS[order.linen_color] || order.linen_color;
    }
    return '-';
  };

  const items = order.items as Record<string, number>;
  const orderedItems = LINEN_ORDER.filter(key => items[key] && items[key] > 0);

  return (
    <Card className="border-l-4 border-l-orange-400 shadow-sm">
      <CardHeader className="pb-2 pt-3 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold text-base">
              {order.houses?.name || 'Unbekannte Unterkunft'}
            </span>
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              Einzelbestellung
            </Badge>
          </div>
          <Badge className={`${getStatusColor(order.status)} text-xs`}>
            {getStatusText(order.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-3 sm:px-6 pb-4 space-y-4">
        {/* Delivery Info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(order.delivery_date)}</span>
            {order.delivery_time && <span className="text-xs">({order.delivery_time})</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4" />
            <span>{getDeliveryTypeLabel(order.delivery_type)}</span>
          </div>
          {order.laundry_staff?.name && (
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{order.laundry_staff.name}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
            {order.notes}
          </p>
        )}

        {/* Items Table */}
        {orderedItems.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-semibold text-foreground">Artikel</th>
                  <th className="text-left p-2 font-semibold text-foreground">Farbe</th>
                  <th className="text-right p-2 font-semibold text-foreground">Menge</th>
                </tr>
              </thead>
              <tbody>
                {orderedItems.map((key) => (
                  <tr key={key} className="border-t">
                    <td className="p-2">{LINEN_LABELS[key] || key}</td>
                    <td className="p-2 font-medium text-foreground">{getItemColor(key)}</td>
                    <td className="p-2 text-right font-medium">{items[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Select value={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="confirmed">Bestätigt</SelectItem>
              <SelectItem value="in_delivery">In Lieferung</SelectItem>
              <SelectItem value="delivered">Geliefert</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={order.assigned_staff_id || ""} 
            onValueChange={handleAssignStaff}
          >
            <SelectTrigger className="w-[160px] h-9 text-xs">
              <SelectValue placeholder="Mitarbeiter..." />
            </SelectTrigger>
            <SelectContent>
              {laundryStaff.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setDeliveryDialogOpen(true);
            }}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Lieferung
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setNotesDialogOpen(true);
            }}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Notizen
          </Button>
        </div>
      </CardContent>

      <DeliveryDateDialog
        open={deliveryDialogOpen}
        onOpenChange={setDeliveryDialogOpen}
        order={order}
        onUpdate={onUpdate}
      />

      <LinenNotesDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        order={order}
        onUpdate={onUpdate}
      />
    </Card>
  );
};

export default StandaloneOrderCard;
