-- Enable Realtime for user_view_settings table
ALTER TABLE user_view_settings REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE user_view_settings;