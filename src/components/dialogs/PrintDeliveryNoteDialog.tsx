import { useState, useEffect } from "react";
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

interface PrintDeliveryNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: LinenOrder | null;
  onUpdate?: () => void;
}

const PrintDeliveryNoteDialog = ({ open, onOpenChange, order, onUpdate }: PrintDeliveryNoteDialogProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  // Cleanup print container when dialog closes
  useEffect(() => {
    if (!open) {
      const existingContainer = document.getElementById('print-container');
      if (existingContainer) {
        existingContainer.remove();
      }
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

  // Generiert reines HTML für den Print-Container - iOS-kompatibel
  // KEINE Emojis, KEINE CSS-Klassen, NUR Inline-Styles
  // KEINE flex/grid - nur einfache block-Elemente für maximale iOS-Kompatibilität
  const generatePrintContent = () => {
    const itemRows = LINEN_ORDER
      .filter(key => items[key] && items[key] > 0)
      .map(key => `
        <tr>
          <td style="padding: 8px; border: 1px solid #333; font-family: Arial, sans-serif;">${getLinenLabel(key)}</td>
          <td style="padding: 8px; border: 1px solid #333; font-family: Arial, sans-serif;">${getItemColor(key)}</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-weight: 500; font-family: Arial, sans-serif;">${items[key]}</td>
        </tr>
      `).join('');

    // iOS-optimiert: KEINE flex/grid, nur block und table-Layouts
    return `
      <div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000; padding: 10mm; background: white; width: 100%; box-sizing: border-box;">
        
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 16px;">
          <h1 style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 0;">LIEFERSCHEIN</h1>
          <p style="font-size: 16px; color: #666; margin: 4px 0 0 0;">Wäsche Pinzgau</p>
          <p style="margin-top: 8px; font-size: 14px; font-weight: 600;">
            Bestell-Nr: #${order.id.substring(0, 8).toUpperCase()}
          </p>
        </div>

        <!-- Lieferadresse -->
        <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #ddd; background: #f5f5f5;">
          <p style="font-weight: 600; margin: 0 0 4px 0;">Lieferadresse:</p>
          <p style="font-size: 18px; font-weight: 600; margin: 0;">${order.houses?.name || 'Unbekanntes Haus'}</p>
          ${order.houses?.address ? `<p style="font-size: 14px; color: #666; margin: 4px 0 0 0;">${order.houses.address}</p>` : ''}
        </div>

        <!-- Buchungsdetails -->
        ${order.bookings ? `
          <div style="margin-bottom: 16px; padding: 12px; border: 1px solid #ddd;">
            <p style="font-weight: 600; margin: 0 0 8px 0;">Buchungsdetails:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; width: 50%;"><strong>Gast:</strong> ${order.bookings.guest_name}</td>
                <td style="padding: 4px 0; width: 50%;"><strong>Gäste:</strong> ${order.bookings.number_of_guests} Personen</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;"><strong>Check-in:</strong> ${formatDate(order.bookings.check_in)}</td>
                <td style="padding: 4px 0;"><strong>Check-out:</strong> ${formatDate(order.bookings.check_out)}</td>
              </tr>
            </table>
          </div>
        ` : ''}

        <!-- Lieferinfo - als Tabelle statt Flexbox -->
        <table style="width: 100%; margin-bottom: 16px; border-collapse: separate; border-spacing: 8px 0;">
          <tr>
            <td style="width: 50%; padding: 12px; border: 1px solid #ddd; vertical-align: top;">
              <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px 0;">Lieferdatum:</p>
              <p style="font-size: 13px; margin: 0;">
                ${formatDate(order.delivery_date)}${formatTime(order.delivery_time)}
              </p>
            </td>
            <td style="width: 50%; padding: 12px; border: 1px solid #ddd; vertical-align: top;">
              <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px 0;">Lieferart:</p>
              <p style="font-size: 13px; margin: 0;">${getDeliveryTypeText(order.delivery_type)}</p>
            </td>
          </tr>
        </table>

        <!-- Artikel-Tabelle -->
        <div style="margin-bottom: 16px;">
          <table style="width: 100%; margin-bottom: 8px;">
            <tr>
              <td style="font-weight: 600;">Artikel:</td>
              <td style="text-align: right;"><span style="font-size: 12px; background: #e0e7ff; color: #3730a3; padding: 4px 8px;">${totalItems} Stück gesamt</span></td>
            </tr>
          </table>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid #333; background: #f0f0f0; font-weight: bold; text-align: left;">Artikel</th>
                <th style="padding: 8px; border: 1px solid #333; background: #f0f0f0; font-weight: bold; text-align: left;">Farbe</th>
                <th style="padding: 8px; border: 1px solid #333; background: #f0f0f0; font-weight: bold; text-align: right;">Anzahl</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
              <tr>
                <td style="padding: 8px; border: 1px solid #333; border-top: 2px solid #000; font-weight: bold;" colspan="2">GESAMT</td>
                <td style="padding: 8px; border: 1px solid #333; border-top: 2px solid #000; text-align: right; font-weight: bold;">${totalItems}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Notizen -->
        <div style="margin-bottom: 16px;">
          <p style="font-weight: 600; margin: 0 0 8px 0;">Notizen:</p>
          <div style="padding: 12px; border: 1px solid #ddd; min-height: 60px; background: #fafafa;">
            ${order.notes || 'Keine Notizen'}
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #ddd; padding-top: 12px; margin-top: 16px; font-size: 12px; color: #666;">
          <span>Erstellt: ${new Date().toLocaleDateString('de-DE')}</span>
        </div>
      </div>
    `;
  };

  // Einfacher Druck-Ansatz: opacity-basiert, CSS @media print erledigt den Rest
  const handlePrint = (): Promise<void> => {
    return new Promise((resolve) => {
      // 1. Existierenden Container entfernen
      const existingContainer = document.getElementById('print-container');
      if (existingContainer) existingContainer.remove();

      // 2. Neuen Container erstellen
      const printContainer = document.createElement('div');
      printContainer.id = 'print-container';
      printContainer.innerHTML = generatePrintContent();
      
      // 3. Mit opacity: 0 einfügen (CSS @media print macht den Rest)
      printContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        opacity: 0;
        pointer-events: none;
        background: white;
      `;
      
      document.body.appendChild(printContainer);
      
      // 4. Kurze Verzögerung, dann drucken
      setTimeout(() => {
        // Fokus entfernen (Tastatur-Fix)
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        
        // Sichtbar machen für Print
        printContainer.style.opacity = '1';
        
        window.print();
        
        // Aufräumen
        setTimeout(() => {
          printContainer.remove();
          resolve();
        }, 300);
      }, 100);
    });
  };

  const handlePrintClick = async () => {
    // SOFORT: Fokus entfernen um Tastatur zu verhindern
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    setIsPrinting(true);
    try {
      await handlePrint();
      onOpenChange(false);
    } finally {
      setIsPrinting(false);
    }
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
                <p><strong>Gast:</strong> {order.bookings.guest_name}</p>
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
