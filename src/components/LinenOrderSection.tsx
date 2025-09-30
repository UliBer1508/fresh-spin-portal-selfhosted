import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
// v3 - Emojis statt Lucide Icons
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewSettings } from "@/components/ViewSettingsDialog";
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
  viewSettings: ViewSettings;
}

const LinenOrderSection = ({ linenOrders, onUpdate, viewSettings }: LinenOrderSectionProps) => {
  const [selectedOrder, setSelectedOrder] = useState<LinenOrder | null>(null);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [laundryStaff, setLaundryStaff] = useState<LaundryStaff[]>([]);

  // Fetch laundry staff for assignment dropdown
  useEffect(() => {
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

    fetchLaundryStaff();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('linen_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Status erfolgreich aktualisiert');
      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Fehler beim Aktualisieren des Status');
    }
  };

  const handleAssignStaff = async (orderId: string, staffId: string) => {
    try {
      const { error } = await supabase
        .from('linen_orders')
        .update({ assigned_staff_id: staffId })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Wäschekraft erfolgreich zugewiesen');
      onUpdate?.();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error('Fehler beim Zuweisen der Wäschekraft');
    }
  };

  const handleUnassignStaff = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('linen_orders')
        .update({ assigned_staff_id: null })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Zuweisung erfolgreich entfernt');
      onUpdate?.();
    } catch (error) {
      console.error('Error unassigning staff:', error);
      toast.error('Fehler beim Entfernen der Zuweisung');
    }
  };

  const handleShowItems = (order: LinenOrder) => {
    setSelectedOrder(order);
    setItemsDialogOpen(true);
  };

  const handleEditDelivery = (order: LinenOrder) => {
    setSelectedOrder(order);
    setDeliveryDialogOpen(true);
  };

  const handleShowNotes = (order: LinenOrder) => {
    setSelectedOrder(order);
    setNotesDialogOpen(true);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "geliefert":
      case "completed":
        return "border-success text-success bg-success/10";
      case "in_progress":
      case "assigned":
        return "border-warning text-warning bg-warning/10";
      case "pending":
      default:
        return "border-muted-foreground text-muted-foreground bg-muted/50";
    }
  };

  const getStatusText = (status?: string) => {
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
          <span className="text-lg">⚠️</span>
          <span className="text-muted-foreground">Keine Wäschebestellung vorhanden</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="border-t border-border pt-3">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg">🧺</span>
          <h4 className="font-medium text-foreground">Wäschebestellung</h4>
        </div>
        
        {linenOrders.map((order) => (
          <div key={order.id} className="bg-accent rounded-lg p-3 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                {order.service_providers?.name && (
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🚚</span>
                    <span className="text-sm text-foreground">
                      Provider: <span className="font-medium">{order.service_providers.name}</span>
                    </span>
                  </div>
                )}

                {(viewSettings.showDeliveryDate || viewSettings.showDeliveryTime || viewSettings.showDeliveryType) && (
                  <div className="flex items-center space-x-2">
                    <span className="text-base">📅</span>
                    <span className="text-sm text-foreground">
                      {viewSettings.showDeliveryType ? `${getDeliveryTypeText(order.delivery_type)}: ` : ''}
                      {(viewSettings.showDeliveryDate || viewSettings.showDeliveryTime) ? 
                        formatDateTime(
                          viewSettings.showDeliveryDate ? order.delivery_date : undefined,
                          viewSettings.showDeliveryTime ? order.delivery_time : undefined
                        ) : ''
                      }
                    </span>
                  </div>
                )}

                {/* Staff Assignment */}
                {viewSettings.showAssignedStaff && (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-base">👤</span>
                      <span className="text-sm text-foreground">Zugewiesen:</span>
                    </div>
                    <div className="ml-6">
                      <Select
                        value={order.assigned_staff_id || "none"}
                        onValueChange={(value) => value !== "none" && handleAssignStaff(order.id, value)}
                      >
                        <SelectTrigger className="w-full max-w-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-base">➕</span>
                            <SelectValue placeholder="Wäschekraft zuweisen..." />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-60">
                          <SelectItem value="none" className="cursor-pointer hover:bg-accent hover:text-accent-foreground">
                            Keine Zuweisung
                          </SelectItem>
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
                              value="unassign" 
                              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                              onSelect={() => handleUnassignStaff(order.id)}
                            >
                              Zuweisung entfernen
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {viewSettings.showOrderItems && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShowItems(order)}
                  >
                    <span className="text-base mr-1">📋</span>
                    Artikel anzeigen
                  </Button>
                )}
                
                {(viewSettings.showDeliveryDate || viewSettings.showDeliveryTime || viewSettings.showDeliveryType) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditDelivery(order)}
                  >
                    <span className="text-base mr-1">⏰</span>
                    {(order.status?.toLowerCase() === 'delivered' || order.status?.toLowerCase() === 'geliefert' || order.status?.toLowerCase() === 'completed') 
                      ? `${getDeliveryTypeText(order.delivery_type)}stermin ansehen`
                      : `${getDeliveryTypeText(order.delivery_type)}stermin bearbeiten`}
                  </Button>
                )}

                {viewSettings.showOrderStatus && (
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
                )}
              </div>
            </div>

            {order.notes && viewSettings.showOrderNotes && (
              <div className="mt-2 p-2 bg-background rounded border-l-4 border-l-info">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">📝</span>
                    <span className="text-sm font-medium text-foreground">Notizen:</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShowNotes(order)}
                    className="h-auto py-1 px-2"
                  >
                    <span className="text-base">✏️</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground ml-6">{order.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dialogs */}
      <LinenItemsDialog
        open={itemsDialogOpen}
        onOpenChange={setItemsDialogOpen}
        order={selectedOrder}
      />

      <DeliveryDateDialog
        open={deliveryDialogOpen}
        onOpenChange={setDeliveryDialogOpen}
        order={selectedOrder}
        onUpdate={onUpdate}
      />

      <LinenNotesDialog
        open={notesDialogOpen}
        onOpenChange={setNotesDialogOpen}
        order={selectedOrder}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default LinenOrderSection;