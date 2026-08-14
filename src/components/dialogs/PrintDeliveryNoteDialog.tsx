import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LinenOrder } from "@/hooks/useBookings";
import { getLinenLabel, getLinenColorLabel, LINEN_ORDER } from "@/lib/linenLabels";
import { printDeliveryNote } from "@/lib/printDeliveryNote";
import { getGuestName } from '@/lib/guestHelpers';

interface PrintDeliveryNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: LinenOrder | null;
  onUpdate?: () => void;
}

const PrintDeliveryNoteDialog = ({ open, onOpenChange, order, onUpdate }: PrintDeliveryNoteDialogProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  // Cleanup print iframe when dialog closes
  useEffect(() => {
    if (!open) {
      const existing = document.getElementById('print-iframe');
      if (existing) existing.remove();
    }
  }, [open]);

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

  const handlePrintClick = () => {
    // Fokus entfernen (iOS Tastatur-Fix)
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setIsPrinting(true);
    // WICHTIG: synchron aufrufen – sonst blockiert iOS Safari window.open()
    const result = printDeliveryNote(order);

    if (!result.ok) {
      if (result.reason === "popup-blocked") {
        toast.error(
          "Popup blockiert. Bitte Popups für diese Seite erlauben, dann erneut drucken."
        );
      } else {
        toast.error("Druck fehlgeschlagen. Bitte erneut versuchen.");
      }
      setIsPrinting(false);
      return;
    }

    // Etwas Zeit für Print-Dialog, dann Modal schließen
    setTimeout(() => {
      setIsPrinting(false);
      onOpenChange(false);
    }, 800);
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🖨️ Lieferschein drucken</DialogTitle>
        </DialogHeader>

        {/* Preview Content */}
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center border-b-2 border-foreground pb-4">
            <h1 className="text-2xl font-bold tracking-wide">LIEFERSCHEIN</h1>
            <p className="text-lg font-medium text-muted-foreground mt-1">Wäsche Pinzgau</p>
            <p className="text-sm font-semibold mt-2">
              Bestell-Nr: #{order.id.substring(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Delivery Address */}
          <div className="p-3 bg-muted/30 rounded-lg">
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
            <div className="p-3 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span>👤</span>
                <span className="font-semibold">Buchungsdetails</span>
              </div>
              <div className="ml-6 grid grid-cols-2 gap-2 text-sm">
                <p><strong>Gast:</strong> {getGuestName(order.bookings)}</p>
                <p><strong>Gäste:</strong> {order.bookings.number_of_guests} Personen</p>
                <p><strong>Check-in:</strong> {formatDate(order.bookings.check_in)}</p>
                <p><strong>Check-out:</strong> {formatDate(order.bookings.check_out)}</p>
              </div>
            </div>
          )}

          {/* Delivery Info */}
          <div className="grid grid-cols-2 gap-4">
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
          <div>
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

          {/* Notes - READ ONLY */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span>📝</span>
              <Label className="font-semibold">Notizen</Label>
            </div>
            <div className="min-h-[60px] p-3 bg-muted/30 rounded-lg text-sm">
              {order.notes || <span className="text-muted-foreground italic">Keine Notizen vorhanden</span>}
            </div>
          </div>

          {/* Footer Preview */}
          <div className="border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Bestell-Nr: #{order.id.substring(0, 8)}</span>
              <span>Erstellt: {new Date().toLocaleDateString('de-DE')}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handlePrintClick} 
            disabled={isPrinting}
          >
            {isPrinting ? '⏳ Drucke...' : '🖨️ Drucken'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintDeliveryNoteDialog;
