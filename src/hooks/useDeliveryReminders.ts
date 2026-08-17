// Checks on app start whether any linen orders are due within the user's
// configured `notify_days_in_advance` window and surfaces them one by one.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Booking } from "@/hooks/useBookings";

const STORAGE_KEY = "dismissed-reminders";
const ACTIVE_STATUSES = ["offen", "ausstehend", "pending"];

const parseLocalDate = (dateStr: string): Date => {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const getDismissed = (): Set<string> => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

const addDismissed = (id: string) => {
  try {
    const cur = getDismissed();
    cur.add(id);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(cur)));
  } catch {
    /* noop */
  }
};

export const useDeliveryReminders = () => {
  const [queue, setQueue] = useState<Booking[]>([]);

  const load = useCallback(async () => {
    // 1. Preferences
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("notifications_enabled, notify_days_in_advance")
      .limit(1)
      .maybeSingle();

    const enabled = (prefs as any)?.notifications_enabled ?? true;
    const days = (prefs as any)?.notify_days_in_advance ?? 3;
    if (!enabled) {
      setQueue([]);
      return;
    }

    // 2. Date window (local time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const until = new Date(today.getTime() + days * 86400000);

    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;

    // 3. Fetch due orders
    const { data, error } = await supabase
      .from("linen_orders")
      .select(`
        id, status, delivery_date, delivery_time, delivery_type, notes,
        items, item_variants, provider_id, assigned_staff_id, linen_color,
        house_id, booking_id,
        houses!linen_orders_house_id_fkey ( name, address ),
        service_providers!linen_orders_provider_id_fkey ( name ),
        laundry_staff!linen_orders_assigned_staff_id_fkey ( name ),
        bookings!linen_orders_booking_id_fkey (
          id, number_of_guests,
          guests ( name, email, phone ),
          check_in, check_out, status, house_id,
          houses!bookings_house_id_fkey ( name, address )
        )
      `)
      .in("status", ACTIVE_STATUSES)
      .gte("delivery_date", fmt(today))
      .lte("delivery_date", fmt(until))
      .order("delivery_date", { ascending: true });

    if (error) {
      console.error("[useDeliveryReminders] fetch error", error);
      setQueue([]);
      return;
    }

    const dismissed = getDismissed();

    // 4. Build Booking-shaped objects (each with single linen_order)
    const reminders: Booking[] = (data || [])
      .filter((o: any) => !dismissed.has(o.id) && o.bookings)
      .map((o: any) => ({
        ...o.bookings,
        houses: o.bookings?.houses ?? o.houses,
        linen_orders: [
          {
            id: o.id,
            status: o.status,
            delivery_date: o.delivery_date,
            delivery_time: o.delivery_time,
            delivery_type: o.delivery_type,
            notes: o.notes,
            items: o.items,
            item_variants: o.item_variants,
            provider_id: o.provider_id,
            assigned_staff_id: o.assigned_staff_id,
            linen_color: o.linen_color,
            house_id: o.house_id,
            houses: o.houses,
            service_providers: o.service_providers,
            laundry_staff: o.laundry_staff,
          },
        ],
      }));

    setQueue(reminders);
  }, []);

  useEffect(() => {
    load();
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [load]);

  const currentReminder = queue[0] ?? null;

  const dismissCurrent = useCallback(() => {
    setQueue((prev) => {
      const [first, ...rest] = prev;
      const orderId = first?.linen_orders?.[0]?.id;
      if (orderId) addDismissed(orderId);
      return rest;
    });
  }, []);

  return { currentReminder, dismissCurrent, reload: load };
};
