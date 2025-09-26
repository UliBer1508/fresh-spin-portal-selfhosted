import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LinenOrder } from "@/hooks/useBookings";

interface LinenItemsDialogProps {
  order: LinenOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LinenItemsDialog = ({ order, open, onOpenChange }: LinenItemsDialogProps) => {
  if (!order) return null;

  const items = order.items as Record<string, number>;

  const getItemLabel = (key: string) => {
    const labels: Record<string, string> = {
      bedding: "Bettwäsche",
      bath_mats: "Badematten", 
      sink_towels: "Handtücher",
      large_towels: "Große Handtücher",
      sauna_towels: "Saunahandtücher",
      small_towels: "Kleine Handtücher"
    };
    return labels[key] || key;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wäscheartikel - Bestellung</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {Object.entries(items).map(([key, quantity]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium text-foreground">{getItemLabel(key)}</span>
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