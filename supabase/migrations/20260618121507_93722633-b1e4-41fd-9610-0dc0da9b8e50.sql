DROP POLICY IF EXISTS "Public read notification_preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Public insert notification_preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Public update notification_preferences" ON public.notification_preferences;

CREATE POLICY "Authenticated read notification_preferences"
  ON public.notification_preferences FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "Authenticated insert notification_preferences"
  ON public.notification_preferences FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update notification_preferences"
  ON public.notification_preferences FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

REVOKE SELECT, INSERT, UPDATE ON public.notification_preferences FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;