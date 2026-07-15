import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Shirt, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday,
  addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval,
} from "date-fns";
import { de, enUS, nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { HOUSE_COLORS, getColorByHash, BOOKING_STATUS } from "@/lib/constants";
import { useTranslation } from "react-i18next";

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
  date: Date;
  house: string;
  house_id: string;
  status?: string;
  deliveryTime?: string | null;
}

interface CleaningInfoEvent {
  id: string;
  date: Date;
  house: string;
  house_id: string;
  scheduledTime?: string | null;
}

const CalendarView = () => {
  const { t, i18n } = useTranslation("calendar");
  const locale = getLocale(i18n.language);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("week");
  const [linenEvents, setLinenEvents] = useState<LinenEvent[]>([]);
  const [cleaningInfo, setCleaningInfo] = useState<CleaningInfoEvent[]>([]);
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
          houses!linen_orders_house_id_fkey!inner (name, rental_type)
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
          houses!service_tasks_house_id_fkey!inner (name, rental_type)
        `)
        .eq("houses.rental_type", "tourist")
        .eq("service_type", "cleaning")
        .gte("scheduled_date", rangeStart)
        .lte("scheduled_date", rangeEnd);

      if (!active) return;

      const linen: LinenEvent[] = [];
      (linenOrders || []).forEach((o: any) => {
        if (CANCELLED_STATUSES.has(String(o.status || "").toLowerCase())) return;
        const date = parseLocalDate(o.delivery_date);
        if (!date) return;
        linen.push({
          id: `linen-${o.id}`,
          orderId: o.id,
          date,
          house: o.houses?.name || "—",
          house_id: o.house_id,
          status: o.status,
          deliveryTime: o.delivery_time ?? null,
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
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [rangeStart, rangeEnd]);

  const linenForDay = (day: Date) =>
    linenEvents.filter(e => isSameDay(e.date, day)).sort((a, b) => (a.deliveryTime || "").localeCompare(b.deliveryTime || ""));
  const cleaningForDay = (day: Date) =>
    cleaningInfo.filter(e => isSameDay(e.date, day)).sort((a, b) => (a.scheduledTime || "").localeCompare(b.scheduledTime || ""));

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const upcomingWeeks = useMemo(() => {
    const result: Array<{ start: Date; end: Date; events: LinenEvent[] }> = [];
    for (let i = 1; i <= 4; i++) {
      const start = startOfWeek(addWeeks(currentDate, i), { weekStartsOn: 1 });
      const end = endOfWeek(addWeeks(currentDate, i), { weekStartsOn: 1 });
      const events = linenEvents
        .filter(e => isWithinInterval(e.date, { start, end }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      if (events.length > 0) result.push({ start, end, events });
    }
    return result;
  }, [linenEvents, currentDate]);

  const monthGridDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
    });
  }, [currentDate]);

  const goToToday = () => setCurrentDate(new Date());
  const previousPeriod = () => setCurrentDate(prev => (viewType === "week" ? subWeeks(prev, 1) : subMonths(prev, 1)));
  const nextPeriod = () => setCurrentDate(prev => (viewType === "week" ? addWeeks(prev, 1) : addMonths(prev, 1)));

  const periodTitle =
    viewType === "week"
      ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d. MMM", { locale })} – ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "d. MMM yyyy", { locale })}`
      : format(currentDate, "MMMM yyyy", { locale });

  const weekdayHeader = (t("weekdays.short", { returnObjects: true }) as string[]) || ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  const openDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailOpen(true);
  };

  const houseColor = (houseId: string) => getColorByHash(HOUSE_COLORS, houseId).hex;

  const selectedEvent = selectedOrderId ? linenEvents.find(e => e.orderId === selectedOrderId) : null;

  // eindeutige Häuser für Legende
  const legendHouses = useMemo(() => {
    const map = new Map<string, string>();
    [...linenEvents, ...cleaningInfo].forEach(e => { if (e.house_id) map.set(e.house_id, e.house); });
    return Array.from(map.entries());
  }, [linenEvents, cleaningInfo]);

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

      {viewType === "week" ? (
        /* ---------- WOCHENANSICHT ---------- */
        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-3 md:p-4 space-y-2">
            {weekDays.map(day => {
              const linen = linenForDay(day);
              const cleaning = cleaningForDay(day);
              const todayFlag = isToday(day);
              const hasWork = linen.length > 0;
              const hasInfo = cleaning.length > 0;
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-2.5",
                    hasWork ? "bg-muted/30" : "bg-muted/10",
                    todayFlag && "ring-2 ring-primary ring-inset"
                  )}
                >
                  <div className={cn("w-14 shrink-0 text-sm", !hasWork && !hasInfo && "opacity-60")}>
                    <div className={cn("font-semibold", todayFlag && "text-primary")}>{format(day, "EEE", { locale })}</div>
                    <div className="text-xs text-muted-foreground">{format(day, "d.", { locale })}</div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                    {linen.map(event => {
                      const color = houseColor(event.house_id);
                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => openDetail(event.orderId)}
                          style={{ borderLeftColor: color, borderLeftWidth: 4 }}
                          className="w-full flex items-center gap-2 px-3 py-2 bg-card border border-border/60 rounded-r-lg text-left active:scale-[0.99] transition-transform"
                        >
                          <Shirt className="w-4 h-4 shrink-0" style={{ color }} />
                          <span className="font-medium text-sm truncate">{event.house}</span>
                          <span className="ml-auto text-sm text-muted-foreground shrink-0">
                            {event.deliveryTime ? event.deliveryTime.slice(0, 5) : ""}
                          </span>
                        </button>
                      );
                    })}
                    {/* Reinigung nur als kleine Info-Zeile */}
                    {cleaning.map(c => (
                      <div key={c.id} className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span className="truncate">{t("events.cleaning")} · {c.house}{c.scheduledTime ? " · " + c.scheduledTime.slice(0, 5) : ""}</span>
                      </div>
                    ))}
                    {!hasWork && !hasInfo && (
                      <div className="flex items-center text-sm text-muted-foreground opacity-60">{t("sidebar.noEvents")}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {upcomingWeeks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">{t("sidebar.upcomingWeeks", "Kommende Wochen")}</h3>
              <div className="rounded-lg border border-border bg-card p-3 md:p-4 space-y-2">
                {upcomingWeeks.map(week => (
                  <div key={week.start.toISOString()} className="flex items-start gap-3">
                    <div className="w-28 shrink-0 text-xs text-muted-foreground pt-0.5">
                      {format(week.start, "d. MMM", { locale })} – {format(week.end, "d. MMM", { locale })}
                    </div>
                    <div className="flex-1 flex flex-wrap gap-x-3 gap-y-1">
                      {week.events.map(event => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => openDetail(event.orderId)}
                          className="flex items-center gap-1.5 text-sm active:opacity-70"
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: houseColor(event.house_id) }} />
                          <span className="font-medium">{format(event.date, "EEE", { locale })}</span>
                          <span className="text-muted-foreground">· {event.house}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ---------- MONATSANSICHT ---------- */
        <div className="rounded-lg border border-border bg-card p-3 md:p-4">
          <div className="grid grid-cols-7 gap-1">
            {weekdayHeader.map((d, i) => (
              <div key={i} className="p-2 text-center text-sm font-medium text-muted-foreground">{d}</div>
            ))}
            {monthGridDays.map((day, idx) => {
              const linen = linenForDay(day);
              const cleaning = cleaningForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const todayFlag = isToday(day);
              const shown = linen.slice(0, 3);
              const hidden = linen.length - shown.length;
              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[76px] sm:min-h-[92px] p-1.5 border border-border rounded-sm",
                    isCurrentMonth ? "bg-card" : "bg-muted/40 text-muted-foreground",
                    todayFlag && "ring-2 ring-primary ring-inset"
                  )}
                >
                  <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
                  <div className="space-y-1">
                    {shown.map(event => {
                      const color = houseColor(event.house_id);
                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => openDetail(event.orderId)}
                          style={{ backgroundColor: color }}
                          className="w-full text-[10px] sm:text-xs px-1.5 py-0.5 rounded text-white flex items-center gap-1 truncate active:opacity-80"
                          title={`${event.house}${event.deliveryTime ? " · " + event.deliveryTime.slice(0, 5) : ""}`}
                        >
                          <Shirt className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {event.deliveryTime ? event.deliveryTime.slice(0, 5) + " " : ""}{event.house}
                          </span>
                        </button>
                      );
                    })}
                    {hidden > 0 && (
                      <div className="text-[10px] sm:text-xs text-muted-foreground">{t("events.more", { count: hidden })}</div>
                    )}
                    {/* Reinigung als dezenter Punkt (nur Info) */}
                    {cleaning.length > 0 && shown.length < 3 && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        <span className="truncate">{t("events.cleaning")}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
