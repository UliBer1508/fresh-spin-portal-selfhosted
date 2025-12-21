import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LinenOrder } from "@/hooks/useBookings";
import { getLinenLabel, getLinenColorLabel, LINEN_ORDER } from "@/lib/linenLabels";

interface PrintDeliveryNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: LinenOrder | null;
  onUpdate?: () => void;
}

const PrintDeliveryNoteDialog = ({ open, onOpenChange, order, onUpdate }: PrintDeliveryNoteDialogProps) => {
  const [notes, setNotes] = useState(order?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Update notes when order changes
  useState(() => {
    if (order) {
      setNotes(order.notes || "");
    }
  });

  if (!order) return null;

  const items = order.items as Record<string, number>;
  const totalItems = Object.values(items).reduce((sum, qty) => sum + qty, 0);

  const getItemColor = (itemKey: string): string => {
    const itemVariants = order.item_variants as Record<string, string> | null;
    if (itemVariants && itemVariants[itemKey]) {
      return getLinenColorLabel(itemVariants[itemKey]);
    }
    if (order.linen_color) {
      return getLinenColorLabel(order.linen_color);
    }
    return '-';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    return ` um ${timeString} Uhr`;
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

  const handleSaveAndPrint = async () => {
    setIsSaving(true);
    try {
      // Save notes to database
      const { error } = await supabase
        .from('linen_orders')
        .update({ notes })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Notizen gespeichert');
      onUpdate?.();

      // Print the delivery note
      setTimeout(() => {
        window.print();
        onOpenChange(false);
      }, 100);

    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Fehler beim Speichern der Notizen');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="no-print">
          <DialogTitle>🖨️ Lieferschein drucken</DialogTitle>
        </DialogHeader>

        {/* Print Content */}
        <div ref={printRef} className="print-delivery-note">
          {/* Header */}
          <div className="text-center border-b-2 border-foreground pb-4 mb-4">
            <h1 className="text-2xl font-bold tracking-wide">LIEFERSCHEIN</h1>
            <p className="text-lg font-medium text-muted-foreground mt-1">Teuni Wäscheservice</p>
          </div>

          {/* Delivery Address */}
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-lg">🏠</span>
              <div>
                <p className="font-semibold text-lg">{order.houses?.name || 'Unbekanntes Haus'}</p>
                {order.houses?.address && (
                  <p className="text-sm text-muted-foreground">{order.houses.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          {order.bookings && (
            <div className="mb-4 p-3 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span>👤</span>
                <span className="font-semibold">Buchungsdetails</span>
              </div>
              <div className="ml-6 grid grid-cols-2 gap-2 text-sm">
                <p><strong>Gast:</strong> {order.bookings.guest_name}</p>
                <p><strong>Gäste:</strong> {order.bookings.number_of_guests} Personen</p>
                <p><strong>Check-in:</strong> {formatDate(order.bookings.check_in)}</p>
                <p><strong>Check-out:</strong> {formatDate(order.bookings.check_out)}</p>
              </div>
            </div>
          )}

          {/* Delivery Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span>📅</span>
                <span className="font-semibold text-sm">Lieferdatum</span>
              </div>
              <p className="text-sm ml-6">
                {formatDate(order.delivery_date)}
                {formatTime(order.delivery_time)}
              </p>
            </div>
            <div className="p-3 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span>🚚</span>
                <span className="font-semibold text-sm">Lieferart</span>
              </div>
              <p className="text-sm ml-6">{getDeliveryTypeText(order.delivery_type)}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>📋</span>
                <span className="font-semibold">Artikel</span>
              </div>
              <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                {totalItems} Stück gesamt
              </span>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-foreground">
                  <TableHead className="font-bold text-foreground">Artikel</TableHead>
                  <TableHead className="font-bold text-foreground">Farbe</TableHead>
                  <TableHead className="font-bold text-foreground text-right">Anzahl</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {LINEN_ORDER
                  .filter(key => items[key] && items[key] > 0)
                  .map(key => (
                    <TableRow key={key}>
                      <TableCell className="py-2">{getLinenLabel(key)}</TableCell>
                      <TableCell className="py-2">{getItemColor(key)}</TableCell>
                      <TableCell className="py-2 text-right font-medium">{items[key]}</TableCell>
                    </TableRow>
                  ))
                }
                <TableRow className="border-t-2 border-foreground font-bold">
                  <TableCell colSpan={2}>GESAMT</TableCell>
                  <TableCell className="text-right">{totalItems}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Notes - Editable in Dialog, readonly in print */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span>📝</span>
              <Label className="font-semibold">Notizen</Label>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notizen für den Lieferschein eingeben..."
              className="min-h-[80px] no-print"
            />
            {/* Print version of notes */}
            <div className="hidden print-notes p-3 border border-border rounded-lg min-h-[60px]">
              {notes || 'Keine Notizen'}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-3 mt-4 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Bestell-Nr: #{order.id.substring(0, 8)}</span>
              <span>Erstellt: {new Date().toLocaleDateString('de-DE')}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="no-print mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSaveAndPrint} disabled={isSaving}>
            {isSaving ? '⏳ Speichere...' : '💾 Speichern & 🖨️ Drucken'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintDeliveryNoteDialog;
