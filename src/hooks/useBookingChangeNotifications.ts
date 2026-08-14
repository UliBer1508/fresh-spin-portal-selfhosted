// Pflicht-Benachrichtigungen für Buchungsänderungen (z. B. Gästeanzahl).
// Lädt unbestätigte Einträge aus booking_change_notifications, hält per Realtime
// aktuell, und bietet acknowledge() zum Bestätigen.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStatusChangerName } from "@/lib/utils";

export interface BookingChangeNotification {
  id: string;
  booking_id: string;
  change_type: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  booking?: {
    guest_name: string | null;
    check_in: string | null;
    check_out: string | null;
    number_of_guests: number | null;
    houses?: { name: string | null } | null;
  } | null;
}

export const useBookingChangeNotifications = () => {
  const [queue, setQueue] = useState<BookingChangeNotification[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("booking_change_notifications")
      .select(`
        id, booking_id, change_type, old_value, new_value,
        created_at, acknowledged_at, acknowledged_by,
        bookings!booking_change_notifications_booking_id_fkey (
          guest_name, guests ( name ), check_in, check_out, number_of_guests,
          houses!bookings_house_id_fkey ( name )
        )
      `)
      .is("acknowledged_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[useBookingChangeNotifications] fetch error", error);
      setQueue([]);
      return;
    }

    setQueue(
      (data || []).map((r: any) => ({
        ...r,
        booking: r.bookings,
      })) as BookingChangeNotification[]
    );
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("booking-change-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "booking_change_notifications" },
        () => load()
      )
      .subscribe();

    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  const current = queue[0] ?? null;

  const acknowledge = useCallback(async () => {
    if (!current) return;
    const { data: { user } } = await supabase.auth.getUser();
    const name = getStatusChangerName(user?.email);
    const { error } = await supabase
      .from("booking_change_notifications")
      .update({ acknowledged_at: new Date().toISOString(), acknowledged_by: name })
      .eq("id", current.id);
    if (error) {
      console.error("[useBookingChangeNotifications] acknowledge error", error);
      return;
    }
    setQueue((prev) => prev.slice(1));
  }, [current]);

  return { current, acknowledge, reload: load };
};
