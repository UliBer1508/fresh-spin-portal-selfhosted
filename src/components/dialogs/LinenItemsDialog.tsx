// v6 - Fix React imports consistency
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LinenOrder } from "@/hooks/useBookings";
import { getLinenLabel } from "@/lib/linenLabels";

interface LinenItemsDialogProps {
  order: LinenOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LinenItemsDialog = ({ order, open, onOpenChange }: LinenItemsDialogProps) => {
  if (!order) return null;

  const items = order.items as Record<string, number>;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wäscheartikel - Bestellung</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {Object.entries(items).map(([key, quantity]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium text-foreground">{getLinenLabel(key)}</span>
              <Badge variant="secondary" className="text-sm">
                {quantity} Stück
              </Badge>
            </div>
          ))}
          {Object.keys(items).length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              Keine Artikel in dieser Bestellung
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LinenItemsDialog;