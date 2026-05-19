// v12.4 - Copyright Footer + Cache Fix
import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import SearchAndFilter from "@/components/SearchAndFilter";
import BookingWithOrdersGroup from "@/components/BookingWithOrdersGroup";
import StandaloneOrderCard from "@/components/StandaloneOrderCard";
import CalendarView from "@/components/CalendarView";
import LaundryStaffManagement from "@/components/LaundryStaffManagement";
import NotificationSettings from "@/components/NotificationSettings";
import InvoiceList from "@/components/InvoiceList";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import PWAStatusBar from "@/components/PWAStatusBar";
import PortalChat from "@/components/PortalChat";
import Footer from "@/components/Footer";
import { useBookings, Booking, LinenOrder } from "@/hooks/useBookings";
import { useViewSettings } from "@/hooks/useViewSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Package } from "lucide-react";
import QuickFilterCards, { QuickFilter } from "@/components/QuickFilterCards";

const Index = () => {
  const [activeTab, setActiveTab] = useState("waesche");
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  
  const { bookings, standaloneOrders, loading, error, refetch } = useBookings(() => {
    setHasNewOrders(true);
    toast.info("Neue Bestellung eingegangen!");
  });

  const { 
    settings: viewSettings, 
    showButtonOnMobile,
    loading: settingsLoading,
    saveSettings 
  } = useViewSettings();
  
  // Listen for Service Worker sync messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'TRIGGER_SYNC') {
          console.log('[App] Received sync trigger from SW, refetching data');
          refetch();
        }
      };
      
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [refetch]);

  // Clear old localStorage keys on first load (one-time cleanup)
  useEffect(() => {
    const cleaned = localStorage.getItem('settings-cleaned');
    if (!cleaned) {
      localStorage.removeItem('viewSettings');
      localStorage.removeItem('viewSettings-desktop');
      localStorage.removeItem('viewSettings-mobile');
      localStorage.removeItem('app-version');
      localStorage.setItem('settings-cleaned', 'true');
      console.log('[Cleanup] Removed old localStorage settings keys');
    }
  }, []);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [filteredStandaloneOrders, setFilteredStandaloneOrders] = useState<LinenOrder[]>([]);

  // Group filtered (one-per-order) bookings back by booking id for grouped rendering
  const groupedBookings = useMemo(() => {
    const map = new Map<string, { booking: Booking; orders: LinenOrder[] }>();
    for (const b of filteredBookings) {
      const order = b.linen_orders?.[0];
      const existing = map.get(b.id);
      if (existing) {
        if (order) existing.orders.push(order);
      } else {
        map.set(b.id, { booking: b, orders: order ? [order] : [] });
      }
    }
    return Array.from(map.values());
  }, [filteredBookings]);

  // Mobile Detection (simple check for button visibility logic)
  const isMobile = useIsMobile();

  const handleSettingsChange = async (newSettings: typeof viewSettings) => {
    try {
      await saveSettings(newSettings);
      
      // Toast-Benachrichtigung
      const event = new CustomEvent('show-toast', {
        detail: {
          title: '✓ Gespeichert',
          description: 'Ihre Anzeigeeinstellungen wurden gespeichert',
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      const event = new CustomEvent('show-toast', {
        detail: {
          title: '❌ Fehler',
          description: 'Einstellungen konnten nicht gespeichert werden',
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleShowButtonOnMobileChange = async (value: boolean) => {
    try {
      await saveSettings(viewSettings, value);
    } catch (error) {
      console.error('Error saving mobile button setting:', error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'benachrichtigungen' && hasNewOrders) {
      setHasNewOrders(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "waesche":
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
              quickFilter={quickFilter}
            />

            <QuickFilterCards
              bookings={bookings}
              standaloneOrders={standaloneOrders}
              value={quickFilter}
              onChange={setQuickFilter}
            />


            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Lade Buchungen...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>Fehler beim Laden der Buchungen: {error}</p>
              </div>
            ) : (
              <>
                {/* Standalone Orders Section */}
                {filteredStandaloneOrders.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-foreground">
                      <Package className="w-5 h-5 text-orange-500" />
                      Einzelbestellungen ({filteredStandaloneOrders.length})
                    </h2>
                    <div className="space-y-4">
                      {filteredStandaloneOrders.map((order) => (
                        <StandaloneOrderCard 
                          key={order.id} 
                          order={order} 
                          onUpdate={refetch}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Bookings with Linen Orders */}
                {filteredBookings.length === 0 && standaloneOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Keine Buchungen gefunden.</p>
                  </div>
                ) : filteredBookings.length > 0 && (
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
                )}
              </>
            )}
          </div>
        );
      
      case "kalender":
        return <CalendarView />;
      
      case "rechnungen":
        return <InvoiceList />;
      
      case "waeschekraefte":
        return <LaundryStaffManagement />;
      
      case "benachrichtigungen":
        return <NotificationSettings />;
      
      default:
        // Falls jemand auf einen nicht-existierenden Tab zugreift, zu "waesche" zurückkehren
        if (activeTab !== "waesche") {
          setActiveTab("waesche");
        }
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PWAStatusBar />
      <div className="pt-12 md:pt-0 flex-1">
      <Header 
        viewSettings={viewSettings}
        onSettingsChange={handleSettingsChange}
        isMobileDevice={isMobile}
        showButtonOnMobile={showButtonOnMobile}
        onShowButtonOnMobileChange={handleShowButtonOnMobileChange}
        onChatOpen={() => setIsChatOpen(true)}
      />
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          hasNewOrders={hasNewOrders}
        />
        
        <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 pb-[env(safe-area-inset-bottom)]">
          {renderTabContent()}
        </main>
      </div>

      <Footer />

      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <PortalChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <Toaster />
      <Sonner />
    </div>
  );
};

export default Index;