-- Enable Realtime for all relevant tables (safe idempotent version)
-- This ensures that changes in the database are immediately reflected in the frontend

-- Enable REPLICA IDENTITY FULL for complete row data during updates
-- This is idempotent - running it multiple times has no negative effect
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.linen_orders REPLICA IDENTITY FULL;
ALTER TABLE public.laundry_staff REPLICA IDENTITY FULL;
ALTER TABLE public.service_providers REPLICA IDENTITY FULL;
ALTER TABLE public.houses REPLICA IDENTITY FULL;

-- Only add tables to publication if they're not already there
-- Using DO block to check before adding

DO $$
BEGIN
    -- Add bookings if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'bookings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
    END IF;

    -- Add linen_orders if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'linen_orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.linen_orders;
    END IF;

    -- Add laundry_staff if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'laundry_staff'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.laundry_staff;
    END IF;

    -- Add service_providers if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'service_providers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.service_providers;
    END IF;

    -- Add houses if not already in publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'houses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.houses;
    END IF;
END $$;

-- Add comments to document realtime status
COMMENT ON TABLE public.bookings IS 'Realtime enabled for instant frontend updates';
COMMENT ON TABLE public.linen_orders IS 'Realtime enabled for instant frontend updates';
COMMENT ON TABLE public.laundry_staff IS 'Realtime enabled for instant frontend updates';
COMMENT ON TABLE public.service_providers IS 'Realtime enabled for instant frontend updates';
COMMENT ON TABLE public.houses IS 'Realtime enabled for instant frontend updates';