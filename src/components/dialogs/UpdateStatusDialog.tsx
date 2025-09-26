import { useState } from "react";
import { Check, Truck, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LinenOrder } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UpdateStatusDialogProps {
  order: LinenOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const UpdateStatusDialog = ({ order, open, onOpenChange, onUpdate }: UpdateStatusDialogProps) => {
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          text: "Ausstehend",
          color: "bg-muted text-muted-foreground",
          icon: Clock,
          nextStatus: "in_progress",
          nextText: "In Bearbeitung setzen"
        };
      case "in_progress":
      case "assigned":
        return {
          text: "In Bearbeitung",
          color: "bg-warning text-warning-foreground",
          icon: Truck,
          nextStatus: "delivered",
          nextText: "Als geliefert markieren"
        };
      case "delivered":
      case "geliefert":
      case "completed":
        return {
          text: "Geliefert",
          color: "bg-success text-success-foreground",
          icon: Check,
          nextStatus: null,
          nextText: null
        };
      default:
        return {
          text: status || "Unbekannt",
          color: "bg-muted text-muted-foreground",
          icon: Clock,
          nextStatus: "in_progress",
          nextText: "In Bearbeitung setzen"
        };
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updateData: any = {
        status: newStatus
      };

      // Add notes if provided
      if (notes.trim()) {
        updateData.notes = notes.trim();
      }

      const { error } = await supabase
        .from('linen_orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Status aktualisiert",
        description: `Wäschebestellung wurde auf "${getStatusInfo(newStatus).text}" gesetzt.`,
      });

      onUpdate?.();
      onOpenChange(false);
      setNotes("");
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!order) return null;

  const currentStatusInfo = getStatusInfo(order.status);
  const StatusIcon = currentStatusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Status aktualisieren</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Aktueller Status</Label>
            <div className="flex items-center space-x-2">
              <StatusIcon className="w-4 h-4" />
              <Badge className={currentStatusInfo.color}>
                {currentStatusInfo.text}
              </Badge>
            </div>
          </div>

          {/* Provider Info */}
          {order.service_providers?.name && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Anbieter</Label>
              <p className="text-sm text-muted-foreground">{order.service_providers.name}</p>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notizen (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Informationen zur Statusänderung..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            {currentStatusInfo.nextStatus && currentStatusInfo.nextText && (
              <Button
                onClick={() => handleStatusUpdate(currentStatusInfo.nextStatus!)}
                disabled={updating}
                className="w-full"
              >
                {updating ? "Wird aktualisiert..." : currentStatusInfo.nextText}
              </Button>
            )}
            
            {/* Quick deliver button for pending orders */}
            {order.status?.toLowerCase() === "pending" && (
              <Button
                onClick={() => handleStatusUpdate("delivered")}
                disabled={updating}
                variant="outline"
                className="w-full"
              >
                <Check className="w-4 h-4 mr-2" />
                Direkt als geliefert markieren
              </Button>
            )}

            {/* Already delivered message */}
            {currentStatusInfo.nextStatus === null && (
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <Check className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-sm text-success">Diese Bestellung wurde bereits geliefert</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusDialog;