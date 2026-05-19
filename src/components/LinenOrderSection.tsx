// v9 - Mehrsprachig + einklappbare Artikelliste
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LinenOrder } from "@/hooks/useBookings";
import DeliveryDateDialog from "@/components/dialogs/DeliveryDateDialog";
import LinenNotesDialog from "@/components/dialogs/LinenNotesDialog";
import PrintDeliveryNoteDialog from "@/components/dialogs/PrintDeliveryNoteDialog";
import { getLinenLabel, getLinenColorLabel, LINEN_ORDER } from "@/lib/linenLabels";
import { useTranslation } from "react-i18next";

interface LaundryStaff {
  id: string;
  name: string;
}

interface LinenOrderSectionProps {
  linenOrders: LinenOrder[];
  onUpdate?: () => void;
  viewSettings: ViewSettings;
  hideHeader?: boolean;
}

const LinenOrderSection = ({ linenOrders, onUpdate, viewSettings, hideHeader }: LinenOrderSectionProps) => {
  const { t, i18n } = useTranslation(['orders', 'common']);
  const [selectedOrder, setSelectedOrder] = useState<LinenOrder | null>(null);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [laundryStaff, setLaundryStaff] = useState<LaundryStaff[]>([]);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  const toggleItems = (orderId: string) => {
    setCollapsedItems((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

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
        .update({ 
          status: newStatus,
          status_changed_by: 'Teuni',
          status_changed_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(t('messages.statusUpdated'));
      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('messages.errorStatus'));
    }
  };

  const handleAssignStaff = async (orderId: string, staffId: string) => {
    try {
      const { error } = await supabase
        .from('linen_orders')
        .update({ assigned_staff_id: staffId })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(t('messages.staffAssigned'));
      onUpdate?.();
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error(t('messages.errorAssign'));
    }
  };

  const handleUnassignStaff = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('linen_orders')
        .update({ assigned_staff_id: null })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(t('messages.assignmentRemoved'));
      onUpdate?.();
    } catch (error) {
      console.error('Error unassigning staff:', error);
      toast.error(t('messages.errorUnassign'));
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

  const handleOpenPrintDialog = (order: LinenOrder) => {
    setSelectedOrder(order);
    setPrintDialogOpen(true);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "offen":
        return "border-amber-500 text-amber-800 bg-amber-100";
      case "ausstehend":
      case "pending":
        return "border-yellow-500 text-yellow-800 bg-yellow-100";
      case "delivered":
      case "geliefert":
        return "border-green-500 text-green-800 bg-green-100";
      case "cancelled":
        return "border-red-500 text-red-800 bg-red-100";
      default:
        return "border-border text-foreground bg-secondary";
    }
  };

  const getStatusText = (status?: string) => {
    const statusKey = status?.toLowerCase() || 'unknown';
    const emoji = {
      'offen': '🟠',
      'ausstehend': '🟡',
      'pending': '🟡',
      'delivered': '🟢',
      'geliefert': '🟢',
      'cancelled': '🔴',
    }[statusKey] || '❓';
    
    const normalizedKey = statusKey === 'pending' ? 'ausstehend' : 
                          statusKey === 'geliefert' ? 'delivered' : statusKey;
    
    return `${emoji} ${t(`status.${normalizedKey}`, { defaultValue: status || t('common:unknown') })}`;
  };

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return t('labels.notPlanned');
    
    const formattedDate = new Date(date).toLocaleDateString(i18n.language);
    if (time) {
      return `${formattedDate} - ${time}`;
    }
    return formattedDate;
  };

  const getDeliveryTypeText = (deliveryType?: string) => {
    const type = deliveryType || 'delivery';
    if (type.toLowerCase() === 'pickup' || type.toLowerCase() === 'abholung') {
      return t('deliveryType.pickup');
    }
    return t('deliveryType.delivery');
  };

  // Ermittelt die Farbe für einen bestimmten Artikel
  const getItemColor = (order: LinenOrder, itemKey: string): string => {
    const itemVariants = order.item_variants as Record<string, string> | null;
    if (itemVariants && itemVariants[itemKey]) {
      return t(`linenColors.${itemVariants[itemKey]}`, { defaultValue: getLinenColorLabel(itemVariants[itemKey]) });
    }
    if (order.linen_color) {
      return t(`linenColors.${order.linen_color}`, { defaultValue: getLinenColorLabel(order.linen_color) });
    }
    return '-';
  };

  const getTotalItems = (items: Record<string, number>): number => {
    return Object.values(items).reduce((sum, qty) => sum + qty, 0);
  };

  if (!linenOrders || linenOrders.length === 0) {
    return (
      <div className="mt-4 p-4 bg-muted/30 rounded-lg border-l-4 border-l-warning">
        <div className="flex items-center space-x-2">
          <span className="text-lg">⚠️</span>
          <span className="text-muted-foreground">{t('labels.noOrders')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={hideHeader ? "space-y-2" : "mt-4 space-y-2"}>
      <div className={hideHeader ? "" : "border-t border-border pt-3"}>
        {!hideHeader && (
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">🧺</span>
            <h4 className="font-medium text-foreground">{t('labels.linenOrder')}</h4>
          </div>
        )}
        
        {linenOrders.map((order) => (
          <div key={order.id} className="bg-accent rounded-lg p-3 sm:p-4 mb-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              
              {/* ========== LINKE SPALTE - Metadaten & Aktionen ========== */}
              <div className="space-y-4">
                
                {/* Lieferung mit Bearbeiten-Button */}
                {(viewSettings.showDeliveryDate || viewSettings.showDeliveryTime || viewSettings.showDeliveryType) && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📅</span>
                      <span className="text-sm font-semibold text-foreground">{t('labels.deliveryBy')}:</span>
                    </div>
                    
                    <div className="space-y-2">
                      {(viewSettings.showDeliveryDate || viewSettings.showDeliveryTime) && (
                        <button
                          onClick={() => handleEditDelivery(order)}
                          className="w-full sm:w-auto text-left p-3 rounded-lg border border-border bg-background 
                                   hover:bg-accent hover:border-accent-foreground transition-colors 
                                   cursor-pointer touch-manipulation min-h-[44px]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-foreground text-sm font-bold">
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
                      <span className="text-sm font-semibold text-foreground">{t('common:actions.confirm').split(' ')[0] === 'Confirm' ? 'Status' : 'Status'}</span>
                    </div>
                    
                    <div>
                      <Select 
                        value={order.status || 'ausstehend'} 
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className={`w-full min-h-[44px] touch-manipulation ${getStatusColor(order.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border shadow-lg z-50">
                          <SelectItem 
                            value="offen" 
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                          >
                            🟠 {t('status.offen')}
                          </SelectItem>
                          <SelectItem 
                            value="ausstehend" 
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                          >
                            🟡 {t('status.ausstehend')}
                          </SelectItem>
                          <SelectItem 
                            value="delivered" 
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                          >
                            🟢 {t('status.delivered')}
                          </SelectItem>
                          <SelectItem 
                            value="cancelled" 
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                          >
                            🔴 {t('status.cancelled')}
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
                      <span className="text-sm font-semibold text-foreground">{t('labels.assigned')}</span>
                    </div>
                    
                    <div>
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
                          <SelectValue placeholder={t('labels.assignStaff')} />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-60">
                          <SelectItem 
                            value="none" 
                            className="cursor-pointer hover:bg-accent hover:text-accent-foreground min-h-[44px]"
                          >
                            {t('labels.noAssignment')}
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
                              {t('labels.removeAssignment')}
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
                      <span className="text-sm font-semibold text-foreground">{t('labels.notes')}</span>
                    </div>
                    
                    <div>
                      <button
                        onClick={() => handleEditNotes(order)}
                        className="w-full text-left p-3 rounded-lg border border-border bg-background 
                                   hover:bg-accent hover:border-accent-foreground transition-colors 
                                   cursor-pointer touch-manipulation min-h-[44px]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-foreground text-sm font-bold truncate">
                            {order.notes 

                              ? (order.notes.length > 50 
                                  ? order.notes.substring(0, 50) + '...' 
                                  : order.notes)
                              : t('labels.noNotes')
                            }
                          </span>
                          <span className="text-base flex-shrink-0">✏️</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* LS-Drucken Button */}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPrintDialog(order)}
                    className="w-full sm:w-auto no-print"
                  >
                    🖨️ {t('labels.printDeliveryNote')}
                  </Button>
                </div>
              </div>

              {/* ========== RECHTE SPALTE - Artikel Tabelle ========== */}
              {viewSettings.showOrderItems && (
                <div className="space-y-3">
                  {/* Sticky Header auf Mobile */}
                  <div className="flex items-center justify-between sticky top-0 bg-accent py-2 -mx-3 px-3 sm:static sm:bg-transparent sm:p-0 sm:m-0 z-10 lg:static lg:bg-transparent lg:p-0 lg:m-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📋</span>
                      <span className="text-sm font-semibold text-foreground">
                        {t('labels.items')}
                      </span>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {getTotalItems(order.items as Record<string, number>)} {t('labels.total')}
                    </Badge>
                  </div>
                  
                  {/* Artikel-Tabelle mit Mobile-optimiertem Design */}
                  <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
                    {Object.values(order.items as Record<string, number>).some(qty => qty > 0) ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="py-2 px-3 sm:px-4 text-left text-sm font-semibold text-foreground">
                              {t('labels.items')}
                            </TableHead>
                            <TableHead className="py-2 px-3 sm:px-4 text-left text-sm font-semibold text-foreground">
                              {t('labels.color')}
                            </TableHead>
                            <TableHead className="py-2 px-3 sm:px-4 text-right text-sm font-semibold text-foreground">
                              {t('labels.quantity')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {LINEN_ORDER
                            .filter(key => {
                              const items = order.items as Record<string, number>;
                              return items[key] && items[key] > 0;
                            })
                            .map(key => {
                              const items = order.items as Record<string, number>;
                              const quantity = items[key];
                              return (
                                <TableRow 
                                  key={key} 
                                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                >
                                  <TableCell className="py-3 px-3 sm:px-4 text-sm font-medium text-foreground">
                                    {t(`linenItems.${key}`, { defaultValue: getLinenLabel(key) })}
                                  </TableCell>
                                  <TableCell className="py-3 px-3 sm:px-4 text-sm font-medium text-foreground">
                                    {getItemColor(order, key)}
                                  </TableCell>
                                  <TableCell className="py-3 px-3 sm:px-4 text-right">
                                    <Badge variant="outline" className="font-semibold tabular-nums">
                                      {quantity}×
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          }
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {t('labels.noItems')}
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

      <PrintDeliveryNoteDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        order={selectedOrder}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default LinenOrderSection;
