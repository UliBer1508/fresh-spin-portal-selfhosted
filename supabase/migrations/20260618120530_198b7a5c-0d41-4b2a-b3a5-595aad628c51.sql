
CREATE TABLE public.booking_change_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  change_type text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  acknowledged_by text
);

CREATE INDEX idx_bcn_unacknowledged ON public.booking_change_notifications (created_at) WHERE acknowledged_at IS NULL;
CREATE INDEX idx_bcn_booking ON public.booking_change_notifications (booking_id);

GRANT SELECT, UPDATE ON public.booking_change_notifications TO authenticated;
GRANT ALL ON public.booking_change_notifications TO service_role;

ALTER TABLE public.booking_change_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read change notifications"
  ON public.booking_change_notifications FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated can acknowledge change notifications"
  ON public.booking_change_notifications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.booking_change_notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_change_notifications;

CREATE OR REPLACE FUNCTION public.notify_booking_guest_count_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.number_of_guests IS DISTINCT FROM OLD.number_of_guests THEN
    IF EXISTS (
      SELECT 1 FROM public.linen_orders lo
      WHERE lo.booking_id = NEW.id
        AND lo.status IN ('offen','ausstehend','pending','bestaetigt','bestätigt')
    ) THEN
      INSERT INTO public.booking_change_notifications (booking_id, change_type, old_value, new_value)
      VALUES (NEW.id, 'guest_count', OLD.number_of_guests::text, NEW.number_of_guests::text);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_booking_guest_count_change
  AFTER UPDATE OF number_of_guests ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booking_guest_count_change();
