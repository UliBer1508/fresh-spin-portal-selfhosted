// v7 - Einheitliches Toast-Handling mit sonner
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LinenOrder } from "@/hooks/useBookings";
import { AlertCircle } from "lucide-react";

interface DeliveryDateDialogProps {
  order: LinenOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const DeliveryDateDialog = ({ order, open, onOpenChange, onUpdate }: DeliveryDateDialogProps) => {
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && order) {
      setDeliveryDate(order.delivery_date || "");
      setDeliveryTime(order.delivery_time || "09:00");
    }
    onOpenChange(open);
  };

  const isDelivered = order?.status?.toLowerCase() === 'delivered' || order?.status?.toLowerCase() === 'geliefert' || order?.status?.toLowerCase() === 'completed';

  const handleSave = async () => {
    if (!order || isDelivered) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('linen_orders')
        .update({
          delivery_date: deliveryDate,
          delivery_time: deliveryTime
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success("Liefertermin wurde aktualisiert");

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Update:', error);
      toast.error("Liefertermin konnte nicht aktualisiert werden");
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isDelivered ? 'Liefertermin ansehen' : 'Liefertermin bearbeiten'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isDelivered && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Diese Bestellung wurde bereits geliefert und kann nicht mehr bearbeitet werden.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Aktueller Liefertermin Anzeige */}
          {order.delivery_date && (
            <div className="p-3 bg-accent rounded-lg border border-border">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-base">📅</span>
                <span className="text-sm font-medium text-foreground">Aktueller Liefertermin:</span>
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Datum:</span> {new Date(order.delivery_date).toLocaleDateString('de-DE')}
                </p>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Zeit:</span> {order.delivery_time || '09:00'} Uhr
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="delivery-date">Lieferdatum</Label>
            <Input
              id="delivery-date"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              disabled={isDelivered}
              placeholder="Wähle ein Datum"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-time">Lieferzeit</Label>
            <Input
              id="delivery-time"
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              disabled={isDelivered}
              placeholder="09:00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isDelivered ? "Schließen" : "Abbrechen"}
          </Button>
          {!isDelivered && (
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Speichern..." : "Speichern"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryDateDialog;