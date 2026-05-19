import { useState } from "react";
import { Package } from "lucide-react";
import SearchAndFilter from "@/components/SearchAndFilter";
import BookingCard from "@/components/BookingCard";
import StandaloneOrderCard from "@/components/StandaloneOrderCard";
import { useBookingsContext } from "@/context/BookingsContext";
import { useViewSettings } from "@/hooks/useViewSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Booking, LinenOrder } from "@/hooks/useBookings";

const OrdersPage = () => {
  const { bookings, standaloneOrders, loading, error, refetch } = useBookingsContext();
  const { settings: viewSettings, showButtonOnMobile, saveSettings } = useViewSettings();
  const isMobile = useIsMobile();
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [filteredStandaloneOrders, setFilteredStandaloneOrders] = useState<LinenOrder[]>([]);

  const handleSettingsChange = async (s: typeof viewSettings) => {
    try {
      await saveSettings(s);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShowButtonOnMobileChange = async (v: boolean) => {
    try {
      await saveSettings(viewSettings, v);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <SearchAndFilter
        bookings={bookings}
        standaloneOrders={standaloneOrders}
        onFilteredBookingsChange={setFilteredBookings}
        onFilteredStandaloneOrdersChange={setFilteredStandaloneOrders}
        viewSettings={viewSettings}
        onViewSettingsChange={handleSettingsChange}
        showButtonOnMobile={showButtonOnMobile}
        onShowButtonOnMobileChange={handleShowButtonOnMobileChange}
      />

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Lade Buchungen...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          <p>Fehler beim Laden: {error}</p>
        </div>
      ) : (
        <>
          {filteredStandaloneOrders.length > 0 && (
            <div className="mb-6">
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
                <Package className="w-5 h-5 text-warning" />
                Einzelbestellungen ({filteredStandaloneOrders.length})
              </h2>
              <div className="space-y-4">
                {filteredStandaloneOrders.map((order) => (
                  <StandaloneOrderCard key={order.id} order={order} onUpdate={refetch} />
                ))}
              </div>
            </div>
          )}

          {filteredBookings.length === 0 && standaloneOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Keine Buchungen gefunden.</p>
            </div>
          ) : (
            filteredBookings.length > 0 && (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    viewSettings={viewSettings}
                    onUpdate={refetch}
                  />
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;
