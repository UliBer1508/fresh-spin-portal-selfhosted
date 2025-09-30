import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

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

      toast({
        title: "Erfolg",
        description: "Liefertermin wurde aktualisiert",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Update:', error);
      toast({
        title: "Fehler",
        description: "Liefertermin konnte nicht aktualisiert werden",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Liefertermin bearbeiten</DialogTitle>
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
          
          <div className="space-y-2">
            <Label htmlFor="delivery-date">Lieferdatum</Label>
            <Input
              id="delivery-date"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              disabled={isDelivered}
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