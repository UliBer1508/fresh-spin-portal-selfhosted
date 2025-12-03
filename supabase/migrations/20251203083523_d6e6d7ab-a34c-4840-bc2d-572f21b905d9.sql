-- Alle bestehenden Policies löschen
DROP POLICY IF EXISTS "Users can view own settings" ON user_view_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_view_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_view_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_view_settings;

-- Neue öffentliche Policies (alle können lesen/schreiben)
CREATE POLICY "Public can view settings" ON user_view_settings
  FOR SELECT USING (true);

CREATE POLICY "Public can insert settings" ON user_view_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update settings" ON user_view_settings
  FOR UPDATE USING (true) WITH CHECK (true);