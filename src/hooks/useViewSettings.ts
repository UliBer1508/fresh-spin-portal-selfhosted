import { useState, useEffect, useCallback } from 'react';
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
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // Einstellungen aus DB laden (ohne Auth)
  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_view_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading view settings:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setSettings(dbToSettings(data));
        setShowButtonOnMobile(data.show_button_on_mobile);
        setSettingsId(data.id);
      } else {
        // Keine Einstellungen vorhanden → Default-Eintrag erstellen
        const { data: newData, error: insertError } = await supabase
          .from('user_view_settings')
          .insert({
            ...settingsToDb(defaultSettings),
            show_button_on_mobile: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default settings:', insertError);
        } else if (newData) {
          setSettingsId(newData.id);
        }
      }
    } catch (error) {
      console.error('Error in loadSettings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Einstellungen in DB speichern
  const saveSettings = async (
    newSettings: ViewSettings, 
    newShowButtonOnMobile?: boolean
  ) => {
    try {
      const dbData = {
        ...settingsToDb(newSettings),
        show_button_on_mobile: newShowButtonOnMobile ?? showButtonOnMobile,
      };

      if (settingsId) {
        // Existierenden Eintrag updaten
        const { error } = await supabase
          .from('user_view_settings')
          .update(dbData)
          .eq('id', settingsId);

        if (error) {
          console.error('Error saving view settings:', error);
          throw error;
        }
      } else {
        // Neuen Eintrag erstellen (falls noch keiner existiert)
        const { data, error } = await supabase
          .from('user_view_settings')
          .insert(dbData)
          .select()
          .single();

        if (error) {
          console.error('Error creating view settings:', error);
          throw error;
        }
        if (data) {
          setSettingsId(data.id);
        }
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
  }, [loadSettings]);

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
  }, [loadSettings]);

  return {
    settings,
    showButtonOnMobile,
    loading,
    saveSettings,
    refreshSettings: loadSettings,
  };
};
