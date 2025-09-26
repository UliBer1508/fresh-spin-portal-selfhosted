import { useState, useEffect } from "react";
import { Calendar, Clock, User, Package, FileText, AlertCircle, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LinenOrder } from "@/hooks/useBookings";
import LinenItemsDialog from "@/components/dialogs/LinenItemsDialog";
import DeliveryDateDialog from "@/components/dialogs/DeliveryDateDialog";
import LinenNotesDialog from "@/components/dialogs/LinenNotesDialog";

interface LaundryStaff {
  id: string;
  name: string;
}

interface LinenOrderSectionProps {
  linenOrders: LinenOrder[];
  onUpdate?: () => void;
}

const LinenOrderSection = ({ linenOrders, onUpdate }: LinenOrderSectionProps) => {
  const [selectedOrder, setSelectedOrder] = useState<LinenOrder | null>(null);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [laundryStaff, setLaundryStaff] = useState<LaundryStaff[]>([]);

  useEffect(() => {
    fetchLaundryStaff();
  }, []);

  const fetchLaundryStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('laundry_staff')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setLaundryStaff(data || []);
    } catch (error) {
      console.error('Error fetching laundry staff:', error);
    }
  };

  const handleShowItems = (order: LinenOrder) => {
    setSelectedOrder(order);
    setItemsDialogOpen(true);
  };

  const handleEditDelivery = (order: LinenOrder) => {
    const isDelivered = order.status?.toLowerCase() === 'delivered' || 
                       order.status?.toLowerCase() === 'geliefert' || 
                       order.status?.toLowerCase() === 'completed';
    
    if (isDelivered) {
      // Öffne trotzdem den Dialog, aber er wird als readonly angezeigt
      setSelectedOrder(order);
      setDeliveryDialogOpen(true);
    } else {
      setSelectedOrder(order);
      setDeliveryDialogOpen(true);
    }
  };

  const handleShowNotes = (order: LinenOrder) => {
    setSelectedOrder(order);
    setNotesDialogOpen(true);
  };

  const handleAssignStaff = async (orderId: string, staffId: string) => {
    try {
      const updateData = staffId === "REMOVE" 
        ? { assigned_staff_id: null }
        : { assigned_staff_id: staffId };

      const { error } = await supabase
        .from('linen_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      const message = staffId === "REMOVE" 
        ? 'Zuweisung erfolgreich entfernt'
        : 'Wäschekraft erfolgreich zugewiesen';
      
      toast.success(message);
      handleUpdate();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error('Fehler beim Zuweisen der Wäschekraft');
    }
  };

  const handleUpdate = () => {
    onUpdate?.();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('linen_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Status erfolgreich aktualisiert');
      handleUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Fehler beim Aktualisieren des Status');
    }
  };
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

  const getDeliveryTypeText = (deliveryType?: string) => {
    console.log('delivery_type value:', deliveryType);
    // Fallback to 'delivery' if deliveryType is not provided
    const type = deliveryType || 'delivery';
    switch (type.toLowerCase()) {
      case 'pickup':
      case 'abholung':
        return 'Abholung';
      case 'delivery':
      case 'lieferung':
      default:
        return 'Lieferung';
    }
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
        
        {linenOrders.map((order) => {
          console.log('Rendering order:', order, 'delivery_type:', order.delivery_type);
          return (
          <div key={order.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Select value={order.status || 'pending'} onValueChange={(value) => handleStatusChange(order.id, value)}>
                <SelectTrigger className={`w-48 ${getStatusColor(order.status)}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-50">
                  <SelectItem value="pending" className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    Ausstehend
                  </SelectItem>
                  <SelectItem value="in_progress" className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    In Bearbeitung
                  </SelectItem>
                  <SelectItem value="delivered" className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    Geliefert
                  </SelectItem>
                </SelectContent>
              </Select>
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
                    {getDeliveryTypeText(order.delivery_type)}: {formatDateTime(order.delivery_date, order.delivery_time)}
                  </span>
                </div>

                {/* Staff Assignment with Label */}
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-info" />
                  <span className="text-sm text-foreground">Zugewiesen:</span>
                </div>
                <div className="ml-6">
                  <Select
                    value={order.assigned_staff_id || "none"}
                    onValueChange={(value) => value !== "none" && handleAssignStaff(order.id, value)}
                  >
                    <SelectTrigger className="w-full max-w-sm">
                      <div className="flex items-center space-x-2">
                        <UserPlus className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Wäschekraft zuweisen..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      {!order.assigned_staff_id && (
                        <SelectItem 
                          value="none"
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                        >
                          Keine Zuweisung
                        </SelectItem>
                      )}
                      {laundryStaff.map((staff) => (
                        <SelectItem 
                          key={staff.id} 
                          value={staff.id}
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                        >
                          {staff.name}
                        </SelectItem>
                      ))}
                      {order.assigned_staff_id && (
                        <SelectItem 
                          value="REMOVE"
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                        >
                          Zuweisung entfernen
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShowItems(order)}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Artikel anzeigen
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditDelivery(order)}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  {(order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'geliefert' || order.status?.toLowerCase() === 'completed') 
                    ? `${getDeliveryTypeText(order.delivery_type)}stermin ansehen`
                    : `${getDeliveryTypeText(order.delivery_type)}stermin bearbeiten`}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShowNotes(order)}
                >
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
        )})}
      </div>

      {/* Dialogs */}
      <LinenItemsDialog
        order={selectedOrder}
        open={itemsDialogOpen}
        onOpenChange={setItemsDialogOpen}
      />
      <DeliveryDateDialog
        order={selectedOrder}
        open={deliveryDialogOpen}
        onOpenChange={setDeliveryDialogOpen}
        onUpdate={handleUpdate}
      />
      <LinenNotesDialog
        order={selectedOrder}
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default LinenOrderSection;