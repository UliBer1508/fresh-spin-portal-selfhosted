import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ViewSettings } from '@/components/ViewSettingsDialog';

const defaultSettings: ViewSettings = {
  showAccommodationName: true,
  showAccommodationAddress: true,
  showBookingStatus: true,
  showGuestName: true,
  showGuestCount: true,
  showCheckInDate: true,
  showCheckOutDate: true,
  showLinenOrders: true,
  showOrderStatus: true,
  showDeliveryDate: true,
  showDeliveryTime: true,
  showDeliveryType: true,
  showAssignedStaff: true,
  showOrderItems: true,
  showOrderNotes: true,
};

// Konvertierung: DB-Format → ViewSettings-Format
const dbToSettings = (dbRow: any): ViewSettings => ({
  showAccommodationName: dbRow.show_accommodation_name,
  showAccommodationAddress: dbRow.show_accommodation_address,
  showBookingStatus: dbRow.show_booking_status,
  showGuestName: dbRow.show_guest_name,
  showGuestCount: dbRow.show_guest_count,
  showCheckInDate: dbRow.show_check_in_date,
  showCheckOutDate: dbRow.show_check_out_date,
  showLinenOrders: dbRow.show_linen_orders,
  showOrderStatus: dbRow.show_order_status,
  showDeliveryDate: dbRow.show_delivery_date,
  showDeliveryTime: dbRow.show_delivery_time,
  showDeliveryType: dbRow.show_delivery_type,
  showAssignedStaff: dbRow.show_assigned_staff,
  showOrderItems: dbRow.show_order_items,
  showOrderNotes: dbRow.show_order_notes,
});

// Konvertierung: ViewSettings-Format → DB-Format
const settingsToDb = (settings: ViewSettings) => ({
  show_accommodation_name: settings.showAccommodationName,
  show_accommodation_address: settings.showAccommodationAddress,
  show_booking_status: settings.showBookingStatus,
  show_guest_name: settings.showGuestName,
  show_guest_count: settings.showGuestCount,
  show_check_in_date: settings.showCheckInDate,
  show_check_out_date: settings.showCheckOutDate,
  show_linen_orders: settings.showLinenOrders,
  show_order_status: settings.showOrderStatus,
  show_delivery_date: settings.showDeliveryDate,
  show_delivery_time: settings.showDeliveryTime,
  show_delivery_type: settings.showDeliveryType,
  show_assigned_staff: settings.showAssignedStaff,
  show_order_items: settings.showOrderItems,
  show_order_notes: settings.showOrderNotes,
});

export const useViewSettings = () => {
  const [settings, setSettings] = useState<ViewSettings>(defaultSettings);
  const [showButtonOnMobile, setShowButtonOnMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Einstellungen aus DB laden
  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Nicht eingeloggt: Fallback auf localStorage
        const saved = localStorage.getItem('viewSettings');
        if (saved) {
          setSettings({ ...defaultSettings, ...JSON.parse(saved) });
        }
        const savedButton = localStorage.getItem('showViewSettingsButtonOnMobile');
        setShowButtonOnMobile(savedButton === 'true');
        setLoading(false);
        return;
      }

      // Aus Datenbank laden
      const { data, error } = await supabase
        .from('user_view_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error loading view settings:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setSettings(dbToSettings(data));
        setShowButtonOnMobile(data.show_button_on_mobile);
      } else {
        // Noch keine Einstellungen in DB: localStorage migrieren
        const saved = localStorage.getItem('viewSettings');
        const savedButton = localStorage.getItem('showViewSettingsButtonOnMobile');
        
        if (saved || savedButton) {
          const migratedSettings = saved ? JSON.parse(saved) : defaultSettings;
          const migratedButton = savedButton === 'true';
          
          await saveSettings(migratedSettings, migratedButton);
          
          // localStorage nach Migration löschen
          localStorage.removeItem('viewSettings');
          localStorage.removeItem('showViewSettingsButtonOnMobile');
        }
      }
    } catch (error) {
      console.error('Error in loadSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Einstellungen in DB speichern
  const saveSettings = async (
    newSettings: ViewSettings, 
    newShowButtonOnMobile?: boolean
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Nicht eingeloggt: Fallback auf localStorage
        localStorage.setItem('viewSettings', JSON.stringify(newSettings));
        if (newShowButtonOnMobile !== undefined) {
          localStorage.setItem('showViewSettingsButtonOnMobile', String(newShowButtonOnMobile));
          setShowButtonOnMobile(newShowButtonOnMobile);
        }
        setSettings(newSettings);
        return;
      }

      // In Datenbank speichern (Upsert)
      const dbData = {
        user_id: user.id,
        ...settingsToDb(newSettings),
        ...(newShowButtonOnMobile !== undefined && { 
          show_button_on_mobile: newShowButtonOnMobile 
        }),
      };

      const { error } = await supabase
        .from('user_view_settings')
        .upsert(dbData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving view settings:', error);
        throw error;
      }

      setSettings(newSettings);
      if (newShowButtonOnMobile !== undefined) {
        setShowButtonOnMobile(newShowButtonOnMobile);
      }
    } catch (error) {
      console.error('Error in saveSettings:', error);
      throw error;
    }
  };

  // Initial laden
  useEffect(() => {
    loadSettings();
  }, []);

  // Realtime-Updates abonnieren
  useEffect(() => {
    const channel = supabase
      .channel('view-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_view_settings',
        },
        (payload) => {
          console.log('View settings changed:', payload);
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    settings,
    showButtonOnMobile,
    loading,
    saveSettings,
    refreshSettings: loadSettings,
  };
};
