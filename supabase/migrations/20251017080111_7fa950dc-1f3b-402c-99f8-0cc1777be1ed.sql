-- Enable REPLICA IDENTITY FULL for complete row data during updates
-- This ensures that all row data is captured during realtime updates

-- Only set REPLICA IDENTITY if not already set
DO $$
BEGIN
  -- Set REPLICA IDENTITY FULL for key tables
  ALTER TABLE public.bookings REPLICA IDENTITY FULL;
  ALTER TABLE public.linen_orders REPLICA IDENTITY FULL;
  ALTER TABLE public.laundry_staff REPLICA IDENTITY FULL;
  ALTER TABLE public.service_providers REPLICA IDENTITY FULL;
  ALTER TABLE public.houses REPLICA IDENTITY FULL;
  
  RAISE NOTICE 'REPLICA IDENTITY FULL enabled for all relevant tables';
END $$;