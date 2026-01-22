import { useState, useEffect } from "react";
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

  // Update notes when order changes
  useEffect(() => {
    if (order) {
      setNotes(order.notes || "");
    }
  }, [order]);

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

  // Generiert reines HTML für den Print-Container (kein vollständiges Dokument)
  const generatePrintContent = () => {
    const itemRows = LINEN_ORDER
      .filter(key => items[key] && items[key] > 0)
      .map(key => `
        <tr>
          <td style="padding: 8px; border: 1px solid #333;">${getLinenLabel(key)}</td>
          <td style="padding: 8px; border: 1px solid #333;">${getItemColor(key)}</td>
          <td style="padding: 8px; border: 1px solid #333; text-align: right; font-weight: 500;">${items[key]}</td>
        </tr>
      `).join('');

    return `
      <style>
        #print-container {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #000;
          padding: 15mm;
          max-width: 210mm;
          background: white;
        }
        #print-container .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        #print-container .header h1 {
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 2px;
          margin: 0;
        }
        #print-container .header p {
          font-size: 16px;
          color: #666;
          margin: 4px 0 0 0;
        }
        #print-container .section {
          margin-bottom: 16px;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        #print-container .section-muted {
          background: #f5f5f5;
        }
        #print-container .section-title {
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        #print-container .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        #print-container .house-name {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        #print-container .house-address {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        #print-container .booking-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 13px;
          margin-left: 24px;
        }
        #print-container .booking-grid p {
          margin: 0;
        }
        #print-container table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        #print-container th {
          padding: 8px;
          border: 1px solid #333;
          background: #f0f0f0;
          font-weight: bold;
          text-align: left;
        }
        #print-container th:last-child {
          text-align: right;
        }
        #print-container .total-row {
          font-weight: bold;
          border-top: 2px solid #000;
        }
        #print-container .total-badge {
          font-size: 12px;
          background: #e0e7ff;
          color: #3730a3;
          padding: 4px 8px;
          border-radius: 4px;
        }
        #print-container .notes-box {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          min-height: 60px;
          background: #fafafa;
        }
        #print-container .footer {
          border-top: 1px solid #ddd;
          padding-top: 12px;
          margin-top: 16px;
          font-size: 12px;
          color: #666;
          display: flex;
          justify-content: space-between;
        }
      </style>

      <!-- Header -->
      <div class="header">
        <h1>LIEFERSCHEIN</h1>
        <p>Wäsche Pinzgau</p>
        <p style="margin-top: 8px; font-size: 14px; font-weight: 600;">
          Bestell-Nr: #${order.id.substring(0, 8).toUpperCase()}
        </p>
      </div>

      <!-- Delivery Address -->
      <div class="section section-muted">
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span>🏠</span>
          <div>
            <p class="house-name">${order.houses?.name || 'Unbekanntes Haus'}</p>
            ${order.houses?.address ? `<p class="house-address">${order.houses.address}</p>` : ''}
          </div>
        </div>
      </div>

      <!-- Booking Details -->
      ${order.bookings ? `
        <div class="section">
          <div class="section-title">
            <span>👤</span>
            <span>Buchungsdetails</span>
          </div>
          <div class="booking-grid">
            <p><strong>Gast:</strong> ${order.bookings.guest_name}</p>
            <p><strong>Gäste:</strong> ${order.bookings.number_of_guests} Personen</p>
            <p><strong>Check-in:</strong> ${formatDate(order.bookings.check_in)}</p>
            <p><strong>Check-out:</strong> ${formatDate(order.bookings.check_out)}</p>
          </div>
        </div>
      ` : ''}

      <!-- Delivery Info -->
      <div class="grid-2">
        <div class="section">
          <div class="section-title">
            <span>📅</span>
            <span style="font-size: 13px;">Lieferdatum</span>
          </div>
          <p style="font-size: 13px; margin: 0 0 0 24px;">
            ${formatDate(order.delivery_date)}${formatTime(order.delivery_time)}
          </p>
        </div>
        <div class="section">
          <div class="section-title">
            <span>🚚</span>
            <span style="font-size: 13px;">Lieferart</span>
          </div>
          <p style="font-size: 13px; margin: 0 0 0 24px;">${getDeliveryTypeText(order.delivery_type)}</p>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div class="section-title" style="margin: 0;">
            <span>📋</span>
            <span>Artikel</span>
          </div>
          <span class="total-badge">${totalItems} Stück gesamt</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Artikel</th>
              <th>Farbe</th>
              <th style="text-align: right;">Anzahl</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            <tr class="total-row">
              <td style="padding: 8px; border: 1px solid #333;" colspan="2">GESAMT</td>
              <td style="padding: 8px; border: 1px solid #333; text-align: right;">${totalItems}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Notes -->
      <div style="margin-bottom: 16px;">
        <div class="section-title">
          <span>📝</span>
          <span>Notizen</span>
        </div>
        <div class="notes-box">
          ${notes || 'Keine Notizen'}
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <span>Erstellt: ${new Date().toLocaleDateString('de-DE')}</span>
      </div>
    `;
  };

  // iOS-kompatible Druck-Lösung für Mobile + Desktop
  // Verwendet position:static und versteckt andere Elemente programmatisch
  const handlePrint = () => {
    // 1. Entferne existierenden Print-Container falls vorhanden
    const existingContainer = document.getElementById('print-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // 2. Erstelle neuen Print-Container
    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    printContainer.innerHTML = generatePrintContent();
    
    // 3. STATISCHE Positionierung (iOS-kompatibel)
    // iOS Safari hat Probleme mit position:fixed beim Drucken
    printContainer.style.cssText = `
      position: static;
      display: block;
      background: white;
      width: 100%;
      min-height: 100vh;
    `;
    
    // 4. Am ANFANG von body einfügen (wichtig für iOS)
    document.body.insertBefore(printContainer, document.body.firstChild);
    
    // 5. Alle anderen Elemente verstecken (programmatisch, nicht nur CSS)
    const hiddenElements: HTMLElement[] = [];
    const otherElements = document.body.children;
    
    for (let i = 0; i < otherElements.length; i++) {
      const el = otherElements[i] as HTMLElement;
      if (el.id !== 'print-container') {
        el.dataset.wasPrintHidden = el.style.display;
        el.style.display = 'none';
        hiddenElements.push(el);
      }
    }

    // 6. iOS benötigt längere Wartezeit für DOM-Rendering
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const delay = isIOS ? 500 : 100;
    
    // 7. Explizit display:block setzen vor dem Drucken
    printContainer.style.display = 'block';
    
    setTimeout(() => {
      window.print();
      
      // 8. Nach dem Druck-Dialog: Elemente wiederherstellen
      setTimeout(() => {
        hiddenElements.forEach(el => {
          el.style.display = el.dataset.wasPrintHidden || '';
          delete el.dataset.wasPrintHidden;
        });
        
        const container = document.getElementById('print-container');
        if (container) {
          container.remove();
        }
      }, 1000);
    }, delay);
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

      // Open print tab
      handlePrint();
      
      // Close dialog
      onOpenChange(false);

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

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span>📝</span>
              <Label className="font-semibold">Notizen</Label>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notizen für den Lieferschein eingeben..."
              className="min-h-[80px]"
            />
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
          <Button onClick={handleSaveAndPrint} disabled={isSaving}>
            {isSaving ? '⏳ Speichere...' : '💾 Speichern & 🖨️ Drucken'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintDeliveryNoteDialog;
