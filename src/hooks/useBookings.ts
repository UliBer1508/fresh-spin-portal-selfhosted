import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings with house information and linen orders
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
        .order('check_in', { ascending: true });

      if (bookingsError) throw bookingsError;

      setBookings(bookingsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { bookings, loading, error, refetch: fetchBookings };
};