-- Enable real-time for bookings and linen_orders tables
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER TABLE public.linen_orders REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE linen_orders;