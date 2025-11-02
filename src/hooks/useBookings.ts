// v11.1 - Cache fix after revert
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Booking {
  id: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  number_of_guests: number;
  check_in: string;
  check_out: string;
  status: string;
  house_id: string;
  houses?: {
    name: string;
    address: string;
  };
  linen_orders?: LinenOrder[];
}

export interface LinenOrder {
  id: string;
  booking_id?: string;
  status: string;
  delivery_date?: string;
  delivery_time?: string;
  delivery_type?: string;
  notes?: string;
  items: any;
  provider_id?: string;
  assigned_staff_id?: string;
  service_providers?: {
    name: string;
  };
  laundry_staff?: {
    name: string;
  };
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const fetchBookings = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          houses (
            name,
            address
          ),
          linen_orders (
            id,
            status,
            delivery_date,
            delivery_time,
            delivery_type,
            notes,
            items,
            provider_id,
            assigned_staff_id,
            service_providers (
              name
            ),
            laundry_staff (
              name
            )
          )
        `)
        .not('linen_orders', 'is', null)
        .order('check_in', { ascending: true });

      if (bookingsError) throw bookingsError;

      const bookingsWithLinenOrders = bookingsData?.filter(booking => 
        booking.linen_orders && booking.linen_orders.length > 0
      ) || [];

      setBookings(bookingsWithLinenOrders as unknown as Booking[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching bookings:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      console.log('App is now online');
      setIsOnline(true);
      // Refetch when coming back online
      fetchBookings(false);
    };
    
    const handleOffline = () => {
      console.log('App is now offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial fetch
    fetchBookings();
    
    // Real-time subscriptions
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          console.log('Booking change detected, refetching...');
          fetchBookings(false);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'linen_orders'
        },
        () => {
          console.log('Linen order change detected, refetching...');
          fetchBookings(false);
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      supabase.removeChannel(channel);
    };
  }, []);

  return { 
    bookings, 
    loading, 
    error, 
    isOnline,
    refetch: () => fetchBookings(true) 
  };
};
