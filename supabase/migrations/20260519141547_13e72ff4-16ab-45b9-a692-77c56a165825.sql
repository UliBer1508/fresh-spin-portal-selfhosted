ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_days_in_advance integer NOT NULL DEFAULT 3;