import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks,
} from "date-fns";
import { de, enUS, nl } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { getGuestName } from '@/lib/guestHelpers';
import Belegungsraster, {
  type RasterAufgabe, type RasterHaus, type RasterTexte,
} from "@/components/Belegungsraster";
import { getHouseColors, type RasterBuchung } from "@/lib/belegung";

type ViewType = "week" | "month";

// Status, die eine Wäschelieferung / Reinigung als nicht mehr aktiv markieren -> ausblenden
const CANCELLED_STATUSES = new Set(["cancelled", "storniert", "abgebrochen"]);

const parseLocalDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const getLocale = (lng: string) => (lng === "en" ? enUS : lng === "nl" ? nl : de);

// Wäsche = To-do für Teuni; Reinigung = nur Info
interface LinenEvent {
  id: string;
  orderId: string;
  bookingId?: string | null;
  date: Date;
  house: string;
  house_id: string;
  status?: string;
  deliveryTime?: string | null;
  guestName?: string | null;
  guestCount?: number | null;
  checkIn?: string | null;
  checkOut?: string | null;
}

interface CleaningInfoEvent {
  id: string;
  date: Date;
  house: string;
  house_id: string;
  scheduledTime?: string | null;
  /** Ueber die Buchung wird die Reinigung mit der Wäschelieferung gepaart —
      nicht ueber das Datum. Die Wäsche kommt meist am Vortag; ein
      Datumsvergleich waere eine Annahme ueber die Vorlaufzeit. */
  bookingId?: string | null;
  status?: string | null;
}

const CalendarView = () => {
  const { t, i18n } = useTranslation("calendar");
  const locale = getLocale(i18n.language);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("week");
  const [linenEvents, setLinenEvents] = useState<LinenEvent[]>([]);
  const [cleaningInfo, setCleaningInfo] = useState<CleaningInfoEvent[]>([]);
  // Fuer das Belegungsraster: Haeuser als Zeilen, Buchungen als Balken.
  // Beides lud dieses Portal bisher nicht — die Terminliste brauchte es nicht.
  const [haeuser, setHaeuser] = useState<RasterHaus[]>([]);
  const [buchungen, setBuchungen] = useState<RasterBuchung[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Datenbereich: großzügig laden (aktueller Monat +/- damit Wochenvorschau gefüllt ist)
  const rangeStart = useMemo(() => format(startOfWeek(startOfMonth(subMonths(currentDate, 1)), { weekStartsOn: 1 }), "yyyy-MM-dd"), [currentDate]);
  const rangeEnd = useMemo(() => format(endOfWeek(endOfMonth(addMonths(currentDate, 2)), { weekStartsOn: 1 }), "yyyy-MM-dd"), [currentDate]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      // Wäschelieferungen (To-do)
      const { data: linenOrders } = await supabase
        .from("linen_orders")
        .select(`
          id,
          delivery_date,
          delivery_time,
          status,
          house_id,
          booking_id,
          houses!linen_orders_house_id_fkey!inner (name, rental_type),
          bookings!linen_orders_booking_id_fkey (guests ( name ), number_of_guests, check_in, check_out)
        `)
        .eq("houses.rental_type", "tourist")
        .gte("delivery_date", rangeStart)
        .lte("delivery_date", rangeEnd);

      // Reinigungen (nur Info)
      const { data: serviceTasks } = await supabase
        .from("service_tasks")
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          status,
          service_type,
          house_id,
          booking_id,
          houses!service_tasks_house_id_fkey!inner (name, rental_type)
        `)
        .eq("houses.rental_type", "tourist")
        .eq("service_type", "cleaning")
        .gte("scheduled_date", rangeStart)
        .lte("scheduled_date", rangeEnd);

      // Haeuser = Zeilen des Rasters. Direkt abgefragt statt aus den Terminen
      // abgeleitet, damit ein Haus ohne Lieferung trotzdem eine Zeile bekommt.
      const { data: houseRows } = await supabase
        .from("houses")
        .select("id, name")
        .eq("rental_type", "tourist")
        .order("name");

      // Buchungen = die Balken. Der Zeitraum wird beidseitig grosszuegig
      // erweitert: eine Buchung, die vor rangeStart beginnt und hineinragt,
      // muss sichtbar sein, sonst fehlt der Balken in der ersten Woche.
      const { data: bookingRows } = await supabase
        .from("bookings")
        .select(`
          id,
          house_id,
          check_in,
          check_out,
          status,
          guests ( name ),
          houses!bookings_house_id_fkey!inner (rental_type)
        `)
        .eq("houses.rental_type", "tourist")
        .lte("check_in", rangeEnd)
        .gte("check_out", rangeStart);

      if (!active) return;

      setHaeuser(((houseRows || []) as any[]).map(h => ({ id: h.id, name: h.name })));
      setBuchungen(((bookingRows || []) as any[]).map(b => ({
        id: b.id,
        house_id: b.house_id,
        check_in: b.check_in,
        check_out: b.check_out,
        gastName: getGuestName(b),
        status: b.status,
      })));

      const linen: LinenEvent[] = [];
      (linenOrders || []).forEach((o: any) => {
        if (CANCELLED_STATUSES.has(String(o.status || "").toLowerCase())) return;
        const date = parseLocalDate(o.delivery_date);
        if (!date) return;
        linen.push({
          id: `linen-${o.id}`,
          orderId: o.id,
          bookingId: o.booking_id ?? null,
          date,
          house: o.houses?.name || "—",
          house_id: o.house_id,
          status: o.status,
          deliveryTime: o.delivery_time ?? null,
          guestName: o.bookings ? getGuestName(o.bookings) : null,
          guestCount: o.bookings?.number_of_guests ?? null,
          checkIn: o.bookings?.check_in ?? null,
          checkOut: o.bookings?.check_out ?? null,
        });
      });

      const cleaning: CleaningInfoEvent[] = [];
      (serviceTasks || []).forEach((tk: any) => {
        if (CANCELLED_STATUSES.has(String(tk.status || "").toLowerCase())) return;
        const date = parseLocalDate(tk.scheduled_date);
        if (!date) return;
        cleaning.push({
          id: `cleaning-${tk.id}`,
          date,
          house: tk.houses?.name || "—",
          house_id: tk.house_id,
          scheduledTime: tk.scheduled_time ?? null,
          bookingId: tk.booking_id ?? null,
          status: tk.status ?? null,
        });
      });

      setLinenEvents(linen);
      setCleaningInfo(cleaning);
    };

    fetchData();

    // Realtime: bei Änderungen an linen_orders / service_tasks neu laden
    const channel = supabase
      .channel("teuni-calendar")
      .on("postgres_changes", { event: "*", schema: "public", table: "linen_orders" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "service_tasks" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchData)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [rangeStart, rangeEnd]);

  const tagesSchluessel = (d: Date) => format(d, "yyyy-MM-dd");

  // Wäschelieferungen = Teunis eigene Aufgabe. Die `id` ist bewusst die
  // `orderId`, damit ein Klick im Raster direkt das Detailfenster oeffnet.
  const meineAufgaben = useMemo<RasterAufgabe[]>(() => {
    const bekannt = new Set(haeuser.map(h => h.id));
    return linenEvents
      .filter(e => bekannt.has(e.house_id))
      .map(e => {
        const reinigung = e.bookingId
          ? cleaningInfo.find(c => c.bookingId === e.bookingId)
          : undefined;
        return {
          id: e.orderId,
          house_id: e.house_id,
          datum: tagesSchluessel(e.date),
          uhrzeit: e.deliveryTime,
          status: e.status ?? null,
          booking_id: e.bookingId ?? null,
          titel: `${e.house} — ${t("events.linen")}`,
          hinweis: reinigung
            ? `${t("events.cleaning")}: ${format(reinigung.date, "EEE d. MMM", { locale })}${reinigung.scheduledTime ? " · " + reinigung.scheduledTime.slice(0, 5) : ""}`
            : undefined,
        };
      });
  }, [linenEvents, cleaningInfo, haeuser, t, locale]);

  // Reinigungen = nur Information. Sie sind der Taktgeber: die Wäsche muss
  // vor der Reinigung da sein (siehe Portal-Doku, Abschnitt 3).
  const infoAufgaben = useMemo<RasterAufgabe[]>(
    () =>
      cleaningInfo.map(c => ({
        id: c.id,
        house_id: c.house_id,
        datum: tagesSchluessel(c.date),
        uhrzeit: c.scheduledTime,
        status: c.status ?? null,
        booking_id: c.bookingId ?? null,
        titel: t("events.cleaning"),
      })),
    [cleaningInfo, t]
  );

  const monatsWochen = useMemo(() => {
    const ersterMontag = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const letzterSonntag = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return Math.round(eachDayOfInterval({ start: ersterMontag, end: letzterSonntag }).length / 7);
  }, [currentDate]);

  // Beschriftungen des Rasters. Vorgabewerte sind Deutsch; hier werden sie
  // uebersetzt durchgereicht, damit die Komponente in allen Portalen dieselbe
  // Datei bleibt.
  const rasterTexte = useMemo<RasterTexte>(() => ({
    nichtsZuTun: t("raster.nothingToDo", "Diese Woche nichts zu tun."),
    belegt: t("events.occupied", "Belegt"),
    anreise: t("events.checkIn", "Check-in"),
    abreise: t("events.checkOut", "Check-out"),
    wechseltag: t("raster.changeover", "Wechseltag"),
    frei: t("raster.free", "frei"),
    erledigt: t("raster.done", "erledigt"),
    offen: t("raster.open", "offen"),
    fehltTerminSteht: t("raster.missingDue", "fehlt, Termin steht an"),
    beideHaeuser: t("raster.bothHouses", "beide Häuser am selben Tag"),
    vorhanden: t("raster.there", "da"),
    fehlt: t("raster.missing", "fehlt"),
    pruefen: t("raster.check", "prüfen"),
  }), [t]);

  const goToToday = () => setCurrentDate(new Date());
  const previousPeriod = () => setCurrentDate(prev => (viewType === "week" ? subWeeks(prev, 1) : subMonths(prev, 1)));
  const nextPeriod = () => setCurrentDate(prev => (viewType === "week" ? addWeeks(prev, 1) : addMonths(prev, 1)));

  // Die Belegungsansicht zeigt VIER Wochen; der Titel muss denselben Zeitraum
  // nennen, sonst grenzt er einen Bereich ab, den es nicht gibt.
  const periodTitle =
    viewType === "week"
      ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d. MMM", { locale })} – ${format(endOfWeek(addWeeks(currentDate, 3), { weekStartsOn: 1 }), "d. MMM yyyy", { locale })}`
      : format(currentDate, "MMMM yyyy", { locale });

  const openDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailOpen(true);
  };

  // Hausfarbe aus der gemeinsamen Quelle. Vorher vergab dieses Portal Farben
  // ueber einen Hash der house_id — dasselbe Haus sah in Hausverwaltung,
  // Reinigungsportalen und hier jeweils anders aus.
  const houseColor = (houseId: string) =>
    getHouseColors(haeuser.find(h => h.id === houseId)?.name || "").base;

  const selectedEvent = selectedOrderId ? linenEvents.find(e => e.orderId === selectedOrderId) : null;

  // Häuser-Legende oben: jetzt aus der Häuserliste, nicht aus den Terminen
  // abgeleitet — sonst fehlt ein Haus, sobald es gerade keine Lieferung hat.
  const legendHouses = useMemo(
    () => haeuser.map(h => [h.id, h.name] as [string, string]),
    [haeuser]
  );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">
      {/* Ansichts-Umschalter */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button variant={viewType === "week" ? "default" : "outline"} onClick={() => setViewType("week")} className="min-h-[44px] active:scale-95">
          {t("views.week")}
        </Button>
        <Button variant={viewType === "month" ? "default" : "outline"} onClick={() => setViewType("month")} className="min-h-[44px] active:scale-95">
          {t("views.month")}
        </Button>
      </div>

      {/* Zeitraum-Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base md:text-xl font-semibold">{periodTitle}</h2>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" onClick={previousPeriod} className="h-11 w-11 p-0 rounded-full shadow-sm active:scale-95">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button variant="outline" onClick={goToToday} className="h-11 px-4 rounded-full shadow-sm active:scale-95">
            {t("navigation.today")}
          </Button>
          <Button variant="outline" onClick={nextPeriod} className="h-11 w-11 p-0 rounded-full shadow-sm active:scale-95">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Legende */}
      {legendHouses.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {legendHouses.map(([id, name]) => (
            <div key={id} className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/40">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: houseColor(id) }} />
              <span className="text-xs font-medium">{name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Beide Ansichten zeigen DASSELBE Raster, sie unterscheiden sich nur im
          Zeitraum: vier Wochen ab heute fuer die Arbeit, ein ganzer Monat fuer
          den Ueberblick. Die Wäsche ist Teunis Aufgabe (Symbol in der Zelle),
          die Reinigung nur Information (Streifen am unteren Rand) — sie ist der
          Taktgeber, die Wäsche muss vorher da sein. */}
      <div className="rounded-lg border border-border bg-card p-3 md:p-4">
        {viewType === "week" ? (
          <Belegungsraster
            haeuser={haeuser}
            buchungen={buchungen}
            meineAufgaben={meineAufgaben}
            infoAufgaben={infoAufgaben}
            startDatum={currentDate}
            wochen={4}
            meinSymbol="🧺"
            meinName={t("events.linen")}
            infoName={t("events.cleaning")}
            texte={rasterTexte}
            onAufgabeClick={openDetail}
          />
        ) : (
          <Belegungsraster
            haeuser={haeuser}
            buchungen={buchungen}
            meineAufgaben={meineAufgaben}
            infoAufgaben={infoAufgaben}
            startDatum={startOfMonth(currentDate)}
            wochen={monatsWochen}
            zeigeAufgabenliste={false}
            monatFokus={currentDate}
            meinSymbol="🧺"
            meinName={t("events.linen")}
            infoName={t("events.cleaning")}
            texte={rasterTexte}
            onAufgabeClick={openDetail}
          />
        )}
      </div>

      {/* Detail-Sheet: nur Ansicht */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
          <SheetHeader className="text-left">
            <SheetTitle className="flex items-center gap-2 text-base">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: selectedEvent ? houseColor(selectedEvent.house_id) : "#999" }}
              />
              {t("events.linen")}
            </SheetTitle>
          </SheetHeader>
          {selectedEvent ? (
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{t("gantt.accommodation")}</div>
                <div className="font-medium text-sm mt-0.5">{selectedEvent.house}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Datum</div>
                  <div className="text-sm mt-0.5">{format(selectedEvent.date, "EEE, d. MMM yyyy", { locale })}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Uhrzeit</div>
                  <div className="text-sm mt-0.5">{selectedEvent.deliveryTime ? selectedEvent.deliveryTime.slice(0, 5) : "—"}</div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
                <Badge variant="secondary" className="text-xs mt-1">{selectedEvent.status || "—"}</Badge>
              </div>
              {/* Buchungsinfo: für Teuni ist die Anzahl Gäste entscheidend (Wäschemenge) */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/60">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{t("sidebar.guest")}</div>
                  <div className="text-sm mt-0.5">{selectedEvent.guestName || "—"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{t("detail.guestCount", "Anzahl Gäste")}</div>
                  <div className="text-sm mt-0.5 font-semibold">
                    {selectedEvent.guestCount != null ? selectedEvent.guestCount : "—"}
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <SheetClose asChild>
                  <Button className="w-full min-h-[44px]">{t("common.close", "Schliessen")}</Button>
                </SheetClose>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">{t("sidebar.noEvents")}</p>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CalendarView;
