-- Tabelle für System-Status-Konfigurationen
-- Diese Tabelle speichert alle Status-Definitionen zentral für das gesamte System
CREATE TABLE public.system_status_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status_type TEXT NOT NULL,           -- 'order', 'booking', etc.
  status_key TEXT NOT NULL,            -- 'offen', 'ausstehend', etc.
  label TEXT NOT NULL,                 -- 'Offen', 'Ausstehend', etc.
  emoji TEXT,                          -- '🟠', '🟡', etc.
  color_hex TEXT,                      -- '#f59e0b'
  color_bg TEXT,                       -- 'bg-amber-100'
  color_text TEXT,                     -- 'text-amber-800'
  color_border TEXT,                   -- 'border-amber-300'
  description TEXT,                    -- 'Muss vom Benutzer bestätigt werden'
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(status_type, status_key)
);

-- Trigger für updated_at
CREATE TRIGGER update_system_status_config_updated_at
  BEFORE UPDATE ON public.system_status_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Standard Order-Status-Werte einfügen
INSERT INTO public.system_status_config 
  (status_type, status_key, label, emoji, color_hex, color_bg, color_text, color_border, description, sort_order, is_default)
VALUES
  ('order', 'offen', 'Offen', '🟠', '#f59e0b', 'bg-amber-100', 'text-amber-800', 'border-amber-300', 'Muss vom Benutzer bestätigt werden', 1, false),
  ('order', 'ausstehend', 'Ausstehend', '🟡', '#eab308', 'bg-yellow-100', 'text-yellow-800', 'border-yellow-300', 'Bestätigt, wartet auf Lieferung', 2, true),
  ('order', 'delivered', 'Geliefert', '🟢', '#22c55e', 'bg-green-100', 'text-green-800', 'border-green-300', 'Wurde geliefert', 3, false),
  ('order', 'cancelled', 'Storniert', '🔴', '#ef4444', 'bg-red-100', 'text-red-800', 'border-red-300', 'Storniert', 4, false);

-- RLS aktivieren
ALTER TABLE public.system_status_config ENABLE ROW LEVEL SECURITY;

-- Lesezugriff für alle (öffentliche Konfiguration)
CREATE POLICY "Anyone can read system status config"
  ON public.system_status_config
  FOR SELECT
  USING (true);

-- Kommentar zur Dokumentation
COMMENT ON TABLE public.system_status_config IS 'Zentrale Status-Definitionen für das gesamte System. Status-Typen: order (Wäschebestellungen), booking (Buchungen), etc.';