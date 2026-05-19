// Standalone laundry-order card (separated from BookingCard)
import { Card, CardContent } from "@/components/ui/card";
import LinenOrderSection from "./LinenOrderSection";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { LinenOrder } from "@/hooks/useBookings";
import { BOOKING_COLORS, getColorByHash } from "@/lib/constants";

interface LinenOrderCardProps {
  order: LinenOrder;
  bookingId: string;
  viewSettings: ViewSettings;
  onUpdate?: () => void;
}

const LinenOrderCard = ({ order, bookingId, viewSettings, onUpdate }: LinenOrderCardProps) => {
  const borderColor = getColorByHash(BOOKING_COLORS, bookingId);
  return (
    <Card className={`w-full border-border bg-accent border-l-8 ${borderColor}`}>
      <CardContent className="p-2.5 sm:p-3">
        <LinenOrderSection
          linenOrders={[order]}
          onUpdate={onUpdate}
          viewSettings={viewSettings}
          hideHeader
        />
      </CardContent>
    </Card>
  );
};

export default LinenOrderCard;
