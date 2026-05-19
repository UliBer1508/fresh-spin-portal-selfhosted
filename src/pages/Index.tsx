// v12.4 - Copyright Footer + Cache Fix
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";

import BookingWithOrdersGroup from "@/components/BookingWithOrdersGroup";
import CalendarView from "@/components/CalendarView";
import LaundryStaffManagement from "@/components/LaundryStaffManagement";

import InvoiceList from "@/components/InvoiceList";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAUpdatePrompt from "@/components/PWAUpdatePrompt";
import PWAStatusBar from "@/components/PWAStatusBar";
import PortalChat from "@/components/PortalChat";
import Footer from "@/components/Footer";
import NotificationSettingsDialog from "@/components/NotificationSettingsDialog";
import OrderNotificationDialog from "@/components/OrderNotificationDialog";
import { useBookings, Booking, LinenOrder } from "@/hooks/useBookings";
import { useViewSettings } from "@/hooks/useViewSettings";
import { useIsMobile } from "@/hooks/use-mobile";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import QuickFilterCards, { QuickFilter } from "@/components/QuickFilterCards";

const Index = () => {
  const [activeTab, setActiveTab] = useState("waesche");
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const [orderAlertOpen, setOrderAlertOpen] = useState(false);
  const [alertBooking, setAlertBooking] = useState<Booking | null>(null);

  const handleNewOrder = async (newOrder?: any) => {
    setHasNewOrders(true);
    // Check if notifications are enabled
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("notifications_enabled")
      .limit(1)
      .maybeSingle();
    if (prefs && (prefs as any).notifications_enabled === false) {
      return;
    }
    toast.info("Neue Bestellung eingegangen!");
    // Try to fetch booking with this order to show in popup
    if (newOrder?.booking_id) {
      const { data: bk } = await supabase
        .from("bookings")
        .select(`
          *,
          houses!bookings_house_id_fkey ( name, address ),
          linen_orders!linen_orders_booking_id_fkey (
            id, status, delivery_date, delivery_time, delivery_type, notes,
            items, item_variants, provider_id, assigned_staff_id, linen_color, house_id,
            houses!linen_orders_house_id_fkey ( name, address ),
            service_providers!linen_orders_provider_id_fkey ( name ),
            laundry_staff!linen_orders_assigned_staff_id_fkey ( name )
          )
        `)
        .eq("id", newOrder.booking_id)
        .maybeSingle();
      if (bk) {
        const matched = (bk as any).linen_orders?.find((o: any) => o.id === newOrder.id);
        setAlertBooking({
          ...(bk as any),
          linen_orders: matched ? [matched] : (bk as any).linen_orders,
        });
        setOrderAlertOpen(true);
      }
    }
  };

  const { bookings, loading, error, refetch } = useBookings(handleNewOrder);

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

  // Quick filter helpers
  const getWeekRange = (offsetWeeks: number) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(today.getTime() + (offsetWeeks * 7 - mondayOffset) * 86400000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
    return { weekStart, weekEnd };
  };

  // Transform bookings: one entry per linen_order
  const bookingsWithIndividualOrders = useMemo(() => {
    return bookings.flatMap(booking => {
      const orders = booking.linen_orders || [];
      if (orders.length === 0) return [];
      return orders.map((order) => ({ ...booking, linen_orders: [order] }));
    });
  }, [bookings]);

  // Apply quick filter to bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookingsWithIndividualOrders;
    if (quickFilter) {
      if (quickFilter.type === "house") {
        filtered = filtered.filter((b) => b.houses?.name === quickFilter.value);
      } else if (quickFilter.type === "thisWeek" || quickFilter.type === "nextWeek") {
        const { weekStart, weekEnd } = getWeekRange(quickFilter.type === "thisWeek" ? 0 : 1);
        filtered = filtered.filter((b) => {
          const o = b.linen_orders?.[0];
          const d = o?.delivery_date ? new Date(o.delivery_date) : new Date(b.check_in);
          return d >= weekStart && d < weekEnd;
        });
      }
    }
    return filtered;
  }, [bookingsWithIndividualOrders, quickFilter]);

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
            <QuickFilterCards
              bookings={bookings}
              value={quickFilter}
              onChange={setQuickFilter}
            />


            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Lade Bestellungen...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>Fehler beim Laden der Bestellungen: {error}</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Bestellungen gefunden.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedBookings.map((g) => (
                  <BookingWithOrdersGroup
                    key={g.booking.id}
                    booking={g.booking}
                    orders={g.orders}
                    viewSettings={viewSettings}
                    onUpdate={refetch}
                  />
                ))}
              </div>
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
        // Handled via popup dialog, never rendered as a tab page
        return null;
      
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
          onChatOpen={() => setIsChatOpen(true)}
          onNotificationSettingsOpen={() => setNotifSettingsOpen(true)}
        />
        
        <main className="max-w-7xl mx-auto px-3 py-4 sm:px-6 sm:py-8 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-[env(safe-area-inset-bottom)]">
          {renderTabContent()}
        </main>
      </div>

      <Footer />

      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <PortalChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <NotificationSettingsDialog
        open={notifSettingsOpen}
        onOpenChange={setNotifSettingsOpen}
      />
      <OrderNotificationDialog
        open={orderAlertOpen}
        onOpenChange={setOrderAlertOpen}
        booking={alertBooking}
        viewSettings={viewSettings}
      />
      <Toaster />
      <Sonner />
    </div>
  );
};

export default Index;
