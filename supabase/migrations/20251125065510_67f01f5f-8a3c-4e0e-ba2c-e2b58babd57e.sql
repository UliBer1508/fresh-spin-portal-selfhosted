-- Tabelle für Benutzer-Anzeigeeinstellungen
create table public.user_view_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  
  -- Unterkunft-Einstellungen
  show_accommodation_name boolean not null default true,
  show_accommodation_address boolean not null default true,
  show_booking_status boolean not null default true,
  
  -- Gast-Einstellungen
  show_guest_name boolean not null default true,
  show_guest_count boolean not null default true,
  show_check_in_date boolean not null default true,
  show_check_out_date boolean not null default true,
  
  -- Wäsche-Bestellungen
  show_linen_orders boolean not null default true,
  show_order_status boolean not null default true,
  show_delivery_date boolean not null default true,
  show_delivery_time boolean not null default true,
  show_delivery_type boolean not null default true,
  show_assigned_staff boolean not null default true,
  show_order_items boolean not null default true,
  show_order_notes boolean not null default true,
  
  -- Mobile-Button-Einstellung
  show_button_on_mobile boolean not null default false,
  
  -- Metadaten
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  
  -- Ein Benutzer kann nur eine Einstellung haben
  unique(user_id)
);

-- RLS aktivieren
alter table public.user_view_settings enable row level security;

-- Benutzer können ihre eigenen Einstellungen lesen
create policy "Users can view own settings"
  on public.user_view_settings
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Benutzer können ihre eigenen Einstellungen erstellen
create policy "Users can insert own settings"
  on public.user_view_settings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Benutzer können ihre eigenen Einstellungen aktualisieren
create policy "Users can update own settings"
  on public.user_view_settings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Benutzer können ihre eigenen Einstellungen löschen
create policy "Users can delete own settings"
  on public.user_view_settings
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Index für schnelle Abfragen
create index idx_user_view_settings_user_id 
  on public.user_view_settings(user_id);

-- Trigger für updated_at
create trigger update_user_view_settings_updated_at
  before update on public.user_view_settings
  for each row
  execute function update_updated_at_column();