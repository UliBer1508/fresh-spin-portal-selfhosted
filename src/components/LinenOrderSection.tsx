// v6 - Fix React imports consistency
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
// v3 - Emojis statt Lucide Icons
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LinenOrder } from "@/hooks/useBookings";
import DeliveryDateDialog from "@/components/dialogs/DeliveryDateDialog";
import LinenNotesDialog from "@/components/dialogs/LinenNotesDialog";
import { getLinenLabel } from "@/lib/linenLabels";

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

  const handleEditDelivery = (order: LinenOrder) => {
    setSelectedOrder(order);
    setDeliveryDialogOpen(true);
  };

  const handleEditNotes = (order: LinenOrder) => {
    setSelectedOrder(order);
    setNotesDialogOpen(true);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "geliefert":
      case "completed":
        return "border-success text-success-foreground bg-success";
      case "in_progress":
      case "assigned":
        return "border-warning text-warning-foreground bg-warning";
      case "pending":
      default:
        return "border-border text-foreground bg-secondary";
    }
  };

  const getStatusText = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "geliefert":
      case "completed":
        return "✅ Geliefert";
      case "in_progress":
      case "assigned":
        return "🔄 In Bearbeitung";
      case "pending":
        return "⏳ Ausstehend";
      default:
        return status || "❓ Unbekannt";
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


  const getTotalItems = (items: Record<string, number>): number => {
    return Object.values(items).reduce((sum, qty) => sum + qty, 0);
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
          <div key={order.id} className="bg-accent rounded-lg p-3 sm:p-4 mb-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              
              {/* ========== LINKE SPALTE - Metadaten & Aktionen ========== */}
              <div className="space-y-4">
                
                {/* Provider */}
                {order.service_providers?.name && (
                  <div className="flex items-start space-x-2">
                    <span className="text-lg flex-shrink-0">🚚</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground block mb-0.5">
                        Provider:
                      </span>
                      <span className="text-sm font-medium text-foreground block truncate">
                        {order.service_providers.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Lieferung mit Bearbeiten-Button */}
                {(viewSettings.showDeliveryDate || viewSettings.showDeliveryTime || viewSettings.showDeliveryType) && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📅</span>
                      <span className="text-sm font-semibold text-foreground">Lieferung</span>
                    </div>
                    
                    <div className="ml-8 space-y-2">
                      {/* Liefertyp als Badge */}
                      {viewSettings.showDeliveryType && (
                        <Badge variant="outline" className="font-medium">
                          {getDeliveryTypeText(order.delivery_type)}
                        </Badge>
                      )}
                      
                      {/* Anklickbare Datum und Zeit Anzeige */}
                      {(viewSettings.showDeliveryDate || viewSettings.showDeliveryTime) && (
                        <button
                          onClick={() => handleEditDelivery(order)}
                          className="w-full sm:w-auto text-left p-3 rounded-lg border border-border bg-background 
                                   hover:bg-accent hover:border-accent-foreground transition-colors 
                                   cursor-pointer touch-manipulation min-h-[44px]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-foreground">
                              {formatDateTime(
                                viewSettings.showDeliveryDate ? order.delivery_date : undefined,
                                viewSettings.showDeliveryTime ? order.delivery_time : undefined
                              )}
                            </span>
                            <span className="text-base">⏰</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Status - Mobile-optimiertes Dropdown */}
                {viewSettings.showOrderStatus && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📊</span>
                      <span className="text-sm font-semibold text-foreground">Status</span>
                    </div>
                    
                    <div className="ml-8">
                      <Select 
                        value={order.status || 'pending'} 
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className={`w-full min-h-[44px] touch-manipulation ${getStatusColor(order.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border shadow-lg z-50">
                          <SelectItem 
                            value="pending" 
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                          >
                            ⏳ Ausstehend
                          </SelectItem>
                          <SelectItem 
                            value="in_progress" 
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                          >
                            🔄 In Bearbeitung
                          </SelectItem>
                          <SelectItem 
                            value="delivered" 
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                          >
                            ✅ Geliefert
                          </SelectItem>
                          <SelectItem 
                            value="completed" 
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                          >
                            ✔️ Abgeschlossen
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Zugewiesene Wäschekraft */}
                {viewSettings.showAssignedStaff && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">👤</span>
                      <span className="text-sm font-semibold text-foreground">Zugewiesen</span>
                    </div>
                    
                    <div className="ml-8">
                      <Select
                        value={order.assigned_staff_id || "none"}
                        onValueChange={(value) => {
                          if (value === "unassign") {
                            handleUnassignStaff(order.id);
                          } else if (value !== "none") {
                            handleAssignStaff(order.id, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full min-h-[44px] touch-manipulation">
                          <SelectValue placeholder="Wäschekraft zuweisen..." />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-60">
                          <SelectItem 
                            value="none" 
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                          >
                            Keine Zuweisung
                          </SelectItem>
                          {laundryStaff.map((staff) => (
                            <SelectItem 
                              key={staff.id} 
                              value={staff.id}
                              className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                            >
                              {staff.name}
                            </SelectItem>
                          ))}
                          {order.assigned_staff_id && (
                            <SelectItem 
                              value="unassign" 
                              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground min-h-[44px]"
                            >
                              Zuweisung entfernen
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Notizen - Kompakte anklickbare Anzeige */}
                {viewSettings.showOrderNotes && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📝</span>
                      <span className="text-sm font-semibold text-foreground">Notizen</span>
                    </div>
                    
                    <div className="ml-8">
                      <button
                        onClick={() => handleEditNotes(order)}
                        className="w-full text-left p-3 rounded-lg border border-border bg-background 
                                   hover:bg-accent hover:border-accent-foreground transition-colors 
                                   cursor-pointer touch-manipulation min-h-[44px]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-foreground truncate">
                            {order.notes 
                              ? (order.notes.length > 50 
                                  ? order.notes.substring(0, 50) + '...' 
                                  : order.notes)
                              : 'Keine Notiz vorhanden'
                            }
                          </span>
                          <span className="text-base flex-shrink-0">✏️</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ========== RECHTE SPALTE - Artikel Tabelle ========== */}
              {viewSettings.showOrderItems && (
                <div className="space-y-3">
                  {/* Sticky Header auf Mobile */}
                  <div className="flex items-center justify-between sticky top-0 bg-accent py-2 -mx-3 px-3 sm:static sm:bg-transparent sm:p-0 sm:m-0 z-10 lg:static lg:bg-transparent lg:p-0 lg:m-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📋</span>
                      <span className="text-sm font-semibold text-foreground">
                        Artikel
                      </span>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {getTotalItems(order.items as Record<string, number>)} gesamt
                    </Badge>
                  </div>
                  
                  {/* Artikel-Tabelle mit Mobile-optimiertem Design */}
                  <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
                    {Object.values(order.items as Record<string, number>).some(qty => qty > 0) ? (
                      <Table>
                        <TableBody>
                          {Object.entries(order.items as Record<string, number>)
                            .filter(([_, quantity]) => quantity > 0)
                            .map(([key, quantity]) => (
                              <TableRow 
                                key={key} 
                                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                              >
                                <TableCell className="py-3 px-3 sm:px-4 text-sm font-medium text-foreground">
                                  {getLinenLabel(key)}
                                </TableCell>
                                <TableCell className="py-3 px-3 sm:px-4 text-right">
                                  <Badge variant="outline" className="font-semibold tabular-nums">
                                    {quantity}×
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Keine Artikel in dieser Bestellung
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* Dialogs */}
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
