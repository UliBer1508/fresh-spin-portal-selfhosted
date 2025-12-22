// v7 - Einheitliches Toast-Handling mit sonner
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LinenOrder } from "@/hooks/useBookings";

interface LinenNotesDialogProps {
  order: LinenOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

const LinenNotesDialog = ({ order, open, onOpenChange, onUpdate }: LinenNotesDialogProps) => {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && order) {
      setNotes(order.notes || "");
    }
    onOpenChange(open);
  };

  const handleSave = async () => {
    if (!order) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('linen_orders')
        .update({ notes })
        .eq('id', order.id);

      if (error) throw error;

      toast.success("Notizen wurden aktualisiert");

      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast.error("Notizen konnten nicht aktualisiert werden");
    } finally {
      setIsLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Wäschenotizen bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              placeholder="Besondere Anweisungen oder Notizen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LinenNotesDialog;