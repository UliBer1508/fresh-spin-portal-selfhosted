// v12.3 - Fix onNewOrder dependency
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceTask {
  scheduled_date: string;
  scheduled_time?: string;
  service_type: string;
}

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
  service_tasks?: ServiceTask[];
}

export interface LinenOrder {
  id: string;
  booking_id?: string;
  house_id?: string;
  status: string;
  delivery_date?: string;
  delivery_time?: string;
  delivery_type?: string;
  notes?: string;
  items: any;
  item_variants?: Record<string, string>;
  provider_id?: string;
  assigned_staff_id?: string;
  linen_color?: string;
  service_providers?: {
    name: string;
  };
  laundry_staff?: {
    name: string;
  };
  houses?: {
    name: string;
    address: string;
  };
  bookings?: {
    guest_name: string;
    check_in: string;
    check_out: string;
    number_of_guests: number;
  };
}

export const useBookings = (onNewOrder?: () => void) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Use ref to avoid stale closure in subscription callback
  const onNewOrderRef = useRef(onNewOrder);
  onNewOrderRef.current = onNewOrder;

  const fetchBookings = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      // Fetch bookings with linen orders
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          houses!bookings_house_id_fkey (
            name,
            address
          ),
          linen_orders!linen_orders_booking_id_fkey (
            id,
            status,
            delivery_date,
            delivery_time,
            delivery_type,
            notes,
            items,
            item_variants,
            provider_id,
            assigned_staff_id,
            linen_color,
            house_id,
            houses!linen_orders_house_id_fkey (
              name,
              address
            ),
            service_providers!linen_orders_provider_id_fkey (
              name
            ),
            laundry_staff!linen_orders_assigned_staff_id_fkey (
              name
            )
          ),
          service_tasks!service_tasks_booking_id_fkey (
            scheduled_date,
            scheduled_time,
            service_type
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
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'linen_orders'
        },
        (payload: { new: Record<string, unknown> }) => {
          console.log('Neue Bestellung eingegangen!', payload);
          // Use ref to get current callback without stale closure
          if (onNewOrderRef.current) {
            onNewOrderRef.current();
          }
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
