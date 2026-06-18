DROP POLICY IF EXISTS "Admin full access" ON public.notification_preferences;
CREATE POLICY "Public read notification_preferences" ON public.notification_preferences FOR SELECT USING (true);
CREATE POLICY "Public insert notification_preferences" ON public.notification_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update notification_preferences" ON public.notification_preferences FOR UPDATE USING (true) WITH CHECK (true);
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO anon, authenticated;
GRANT ALL ON public.notification_preferences TO service_role;