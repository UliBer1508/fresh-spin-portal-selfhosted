// v12 - Full i18n Translation Support
import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Home, Sparkles, Shirt, LogIn, LogOut, BedDouble, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, differenceInDays, isAfter, startOfDay, addDays } from "date-fns";

// Parst "YYYY-MM-DD" und "YYYY-MM-DDTHH:mm:ss+00:00" als lokales Datum (kein UTC-Offset Problem)
const parseLocalDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  // Datumsteil extrahieren (vor dem 'T' bei ISO-Timestamps)
  const datePart = dateStr.split('T')[0];
  const parts = datePart.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [year, month, day] = parts;
  if (year < 2000 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(year, month - 1, day);
};
import { de, enUS, nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HOUSE_COLORS, getColorByHash, BOOKING_STATUS } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface CalendarEvent {
  id: string;
  type: 'check-in' | 'check-out' | 'occupied' | 'cleaning' | 'linen';
  date: Date;
  title: string;
  house?: string;
  house_id?: string;
  guest?: string;
  time?: string;
  status?: string;
}

interface Booking {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  house_id: string;
  houses?: { name: string };
}

interface ServiceTask {
  id: string;
  scheduled_date: string;
  service_type: string;
  house_id: string;
  houses?: { name: string };
}

interface LinenOrder {
  id: string;
  delivery_date: string;
  house_id: string;
  houses?: { name: string };
}

interface House {
  id: string;
  name: string;
}

interface GanttBooking {
  id: string;
  guest_name: string;
  check_in: Date | null;
  check_out: Date | null;
  house_id: string;
  house_name: string;
}

// Get consistent color for a house based on its ID
const getHouseColor = (houseId: string) => {
  return getColorByHash(HOUSE_COLORS, houseId);
};

// Event priority for sorting in day cells (lower = higher priority, shown first)
const getEventPriority = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'linen': return 0;
    case 'cleaning': return 1;
    case 'check-out': return 2;
    case 'check-in': return 3;
    case 'occupied': return 4;
    default: return 5;
  }
};

// Get house name abbreviation (e.g., "Wald Chalet" → "WC")
const getHouseAbbreviation = (houseName: string) => {
  if (!houseName) return '';
  const words = houseName.split(' ').filter(w => w.length > 0);
  if (words.length === 1) return houseName.substring(0, 3).toUpperCase();
  return words.map(w => w[0]).join('').toUpperCase().substring(0, 3);
};

const CalendarView = () => {
  const { t, i18n } = useTranslation('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [view, setView] = useState<'month' | 'week' | 'gantt' | 'list'>(() => {
    const saved = localStorage.getItem('calendar-view');
    if (saved === 'month' || saved === 'week' || saved === 'gantt' || saved === 'list') return saved;
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
    return isMobileDevice ? 'list' : 'gantt';
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [ganttBookings, setGanttBookings] = useState<GanttBooking[]>([]);
  const ganttScrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  // Get date-fns locale based on current language
  const getDateLocale = () => {
    switch (i18n.language) {
      case 'de': return de;
      case 'nl': return nl;
      case 'en':
      default: return enUS;
    }
  };

  const dateLocale = getDateLocale();

  // Get weekdays array from translations
  const weekdaysShort = t('weekdays.short', { returnObjects: true }) as string[];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const displayStart = view === 'month' || view === 'gantt' ? monthStart : weekStart;
  const displayEnd = view === 'month' || view === 'gantt' ? monthEnd : weekEnd;
  const displayDays = view === 'month' || view === 'gantt' ? monthDays : weekDays;

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate, i18n.language, view]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const isListView = view === 'list';
      const rangeStart = isListView ? startOfDay(new Date()) : displayStart;
      const rangeEnd = isListView ? addDays(startOfDay(new Date()), 60) : displayEnd;
      const startDate = format(rangeStart, 'yyyy-MM-dd');
      const endDate = format(rangeEnd, 'yyyy-MM-dd');

      // Fetch only tourist houses for legend
      const { data: housesData } = await supabase
        .from('houses')
        .select('id, name')
        .eq('rental_type', 'tourist')
        .order('name');

      if (housesData) {
        setHouses(housesData);
      }

      // Fetch bookings with house_id - only tourist rentals, exclude cancelled
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          guest_name,
          check_in,
          check_out,
          house_id,
          houses!bookings_house_id_fkey!inner (name, rental_type)
        `)
        .eq('houses.rental_type', 'tourist')
        .neq('status', BOOKING_STATUS.CANCELLED)
        .gte('check_out', startDate)
        .lte('check_in', endDate);

      // Fetch service tasks (cleaning) with house_id - only tourist rentals
      const { data: serviceTasks } = await supabase
        .from('service_tasks')
        .select(`
          id,
          scheduled_date,
          scheduled_time,
          status,
          service_type,
          house_id,
          houses!service_tasks_house_id_fkey!inner (name, rental_type)
        `)
        .eq('houses.rental_type', 'tourist')
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .eq('service_type', 'cleaning');

      // Fetch linen orders with house_id - only tourist rentals
      const { data: linenOrders } = await supabase
        .from('linen_orders')
        .select(`
          id,
          delivery_date,
          delivery_time,
          status,
          house_id,
          houses!linen_orders_house_id_fkey!inner (name, rental_type)
        `)
        .eq('houses.rental_type', 'tourist')
        .gte('delivery_date', startDate)
        .lte('delivery_date', endDate);

      const calendarEvents: CalendarEvent[] = [];
      const ganttData: GanttBooking[] = [];

      // Process bookings
      bookings?.forEach((booking: Booking) => {
        const checkInDate = parseLocalDate(booking.check_in);
        const checkOutDate = parseLocalDate(booking.check_out);

        // Skip bookings with invalid dates
        if (!checkInDate || !checkOutDate) return;

        // Add to Gantt data
        ganttData.push({
          id: booking.id,
          guest_name: booking.guest_name,
          check_in: checkInDate,
          check_out: checkOutDate,
          house_id: booking.house_id,
          house_name: booking.houses?.name || ''
        });

        // Add check-in event
        calendarEvents.push({
          id: `checkin-${booking.id}`,
          type: 'check-in',
          date: checkInDate,
          title: t('events.checkIn'),
          house: booking.houses?.name,
          house_id: booking.house_id,
          guest: booking.guest_name
        });

        // Add check-out event
        calendarEvents.push({
          id: `checkout-${booking.id}`,
          type: 'check-out',
          date: checkOutDate,
          title: t('events.checkOut'),
          house: booking.houses?.name,
          house_id: booking.house_id,
          guest: booking.guest_name
        });

        // Add occupied days between check-in and check-out
        const occupiedDays = eachDayOfInterval({ start: checkInDate, end: checkOutDate });
        occupiedDays.forEach((day, index) => {
          if (index > 0 && index < occupiedDays.length - 1) {
            calendarEvents.push({
              id: `occupied-${booking.id}-${format(day, 'yyyy-MM-dd')}`,
              type: 'occupied',
              date: day,
              title: t('events.occupied'),
              house: booking.houses?.name,
              house_id: booking.house_id,
              guest: booking.guest_name
            });
          }
        });
      });

      // Process service tasks (cleaning)
      serviceTasks?.forEach((task: any) => {
        const taskDate = parseLocalDate(task.scheduled_date);
        if (!taskDate) return;
        calendarEvents.push({
          id: `cleaning-${task.id}`,
          type: 'cleaning',
          date: taskDate,
          title: t('events.cleaning'),
          house: task.houses?.name,
          house_id: task.house_id,
          time: task.scheduled_time ? String(task.scheduled_time).slice(0, 5) : undefined,
          status: task.status || undefined,
        });
      });

      // Process linen orders
      linenOrders?.forEach((order: any) => {
        if (order.delivery_date) {
          const deliveryDate = parseLocalDate(order.delivery_date);
          if (!deliveryDate) return;
          calendarEvents.push({
            id: `linen-${order.id}`,
            type: 'linen',
            date: deliveryDate,
            title: t('events.linen'),
            house: order.houses?.name,
            house_id: order.house_id,
            time: order.delivery_time ? String(order.delivery_time).slice(0, 5) : undefined,
            status: order.status || undefined,
          });
        }
      });

      setEvents(calendarEvents);
      setGanttBookings(ganttData);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventsByDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return getEventsByDate(selectedDate);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedDate(event.date);
    setDayDialogOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setDayDialogOpen(true);
  };

  // Get event color - for occupied events use house color
  const getEventColor = (event: CalendarEvent) => {
    if (event.type === 'occupied' && event.house_id) {
      const houseColor = getHouseColor(event.house_id);
      return `${houseColor.bg} ${houseColor.text}`;
    }
    switch (event.type) {
      case 'check-in':
        return 'bg-success text-success-foreground';
      case 'check-out':
        return 'bg-destructive text-destructive-foreground';
      case 'cleaning':
        return 'bg-info text-info-foreground';
      case 'linen':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEventIconColor = (event: CalendarEvent) => {
    if (event.type === 'occupied' && event.house_id) {
      return getHouseColor(event.house_id).bg;
    }
    switch (event.type) {
      case 'check-in':
        return 'bg-success';
      case 'check-out':
        return 'bg-destructive';
      case 'cleaning':
        return 'bg-info';
      case 'linen':
        return 'bg-purple-500';
      default:
        return 'bg-muted';
    }
  };

  // Get display text for event badge
  const getEventDisplayText = (event: CalendarEvent) => {
    const abbr = event.house ? getHouseAbbreviation(event.house) : '';
    
    if (event.type === 'occupied') {
      // For occupied, show house name
      return event.house || t('events.occupied');
    }
    
    // For other types, show type + house abbreviation
    const typeText = event.title;
    return abbr ? `${typeText} • ${abbr}` : typeText;
  };

  const goToPrevious = () => {
    if (view === 'gantt' && isMobile) {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (view === 'month' || view === 'gantt') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const goToNext = () => {
    if (view === 'gantt' && isMobile) {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (view === 'month' || view === 'gantt') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get bookings for a specific house in the Gantt view
  const getHouseBookings = (houseId: string) => {
    return ganttBookings.filter(b => b.house_id === houseId);
  };


  // Auto-scroll to today when Gantt view loads (only on desktop)
  useEffect(() => {
    if (view === 'gantt' && !loading && ganttScrollRef.current && !isMobile) {
      const today = new Date();
      const todayIndex = differenceInDays(today, monthStart);
      
      if (todayIndex >= 0 && todayIndex < monthDays.length) {
        // Calculate scroll position: scroll to show today on the left side
        const scrollContainer = ganttScrollRef.current;
        const totalWidth = scrollContainer.scrollWidth;
        const dayWidth = totalWidth / monthDays.length;
        const scrollPosition = Math.max(0, (todayIndex * dayWidth) - 50);
        
        setTimeout(() => {
          scrollContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }, 100);
      }
    }
  }, [view, loading, currentDate, isMobile]);

  // Persist view state in localStorage
  useEffect(() => {
    localStorage.setItem('calendar-view', view);
  }, [view]);

  // Mobile: Wochenansicht, Desktop: Monatsansicht für Gantt
  const ganttDays = (view === 'gantt' && isMobile) ? weekDays : monthDays;
  const ganttStart = (view === 'gantt' && isMobile) ? weekStart : monthStart;

  // Calculate Gantt grid position - grid columns are 1-indexed
  const getGanttGridPosition = (booking: GanttBooking) => {
    const totalDays = ganttDays.length;
    const referenceStart = ganttStart;
    
    if (!booking.check_in || !booking.check_out) {
      return { gridColumn: '1 / 2' };
    }
    
    const startDayRaw = differenceInDays(booking.check_in, referenceStart);
    const endDayRaw = differenceInDays(booking.check_out, referenceStart);
    
    const startCol = Math.max(1, startDayRaw + 1);
    const endCol = Math.min(totalDays + 1, endDayRaw + 2);
    
    return { gridColumn: `${startCol} / ${endCol}` };
  };

  // Render Gantt Chart View
  const renderGanttView = () => {
    const dayWidth = isMobile ? 'minmax(40px, 1fr)' : 'minmax(24px, 1fr)';
    const gridCols = `repeat(${ganttDays.length}, ${dayWidth})`;

    return (
      <div className="space-y-3">
        <div className="bg-background border rounded-lg overflow-hidden">
          <ScrollArea className="w-full">
            <div ref={ganttScrollRef} className={isMobile ? "min-w-0" : "min-w-[600px]"}>
              {/* Header with days */}
              <div className="flex border-b sticky top-0 bg-background z-10">
                <div className="w-20 md:w-40 shrink-0 p-2 md:p-3 font-medium text-xs md:text-sm border-r bg-muted/50">
                  <Home className="w-4 h-4 md:hidden" />
                  <span className="hidden md:inline">{t('gantt.accommodation')}</span>
                </div>
                <div className="flex-1 grid" style={{ gridTemplateColumns: gridCols }}>
                  {ganttDays.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "p-0.5 md:p-1 text-center text-[10px] md:text-xs border-r last:border-r-0",
                          isToday && "bg-primary/20 font-bold",
                          isWeekend && "bg-muted/30"
                        )}
                      >
                        <div className="font-medium">{format(day, 'd')}</div>
                        <div className="text-muted-foreground text-[9px] md:text-xs">{format(day, 'EEE', { locale: dateLocale })}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* House rows */}
              {houses.map((house) => {
                const houseColor = getHouseColor(house.id);
                const bookings = getHouseBookings(house.id);

                return (
                  <div key={house.id} className="flex border-b last:border-b-0 min-h-[44px] md:min-h-[60px]">
                    {/* House name */}
                    <div className="w-20 md:w-40 shrink-0 p-1.5 md:p-3 border-r bg-muted/20 flex items-center">
                      <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                        <div className={cn("w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0", houseColor.bg)} />
                        <span className="text-[10px] md:text-sm font-medium truncate">{house.name}</span>
                      </div>
                    </div>

                    {/* Timeline with bookings - Grid-based */}
                     <div className="flex-1 relative" style={{ minHeight: isMobile ? '44px' : '60px' }}>
                       {/* Background grid lines layer (absolute, always visible) */}
                       <div className="absolute inset-0 grid" style={{ gridTemplateColumns: gridCols, zIndex: 0 }}>
                         {ganttDays.map((day) => {
                           const isToday = isSameDay(day, new Date());
                           const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                           return (
                             <div
                               key={day.toISOString()}
                               onClick={() => handleDayClick(day)}
                               className={cn(
                                 "border-r last:border-r-0 h-full cursor-pointer hover:bg-primary/5",
                                 isToday && "bg-primary/10",
                                 isWeekend && "bg-muted/20"
                               )}
                             />
                           );
                         })}
                       </div>
                       {/* Booking bars layer (on top of grid lines) */}
                       <div className="absolute inset-0 grid items-center" style={{ gridTemplateColumns: gridCols, zIndex: 1 }}>
                         {bookings.map((booking) => {
                           const gridPos = getGanttGridPosition(booking);
                           const nights = (booking.check_in && booking.check_out) ? differenceInDays(booking.check_out, booking.check_in) : 0;
                           
                           return (
                             <TooltipProvider key={booking.id}>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                    <div
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         if (booking.check_in) handleDayClick(booking.check_in);
                                       }}
                                       className={cn(
                                         "h-6 md:h-8 rounded-md flex items-center px-1 md:px-2 cursor-pointer hover:opacity-90 transition-opacity mx-0.5",
                                         "border border-white/40 shadow-md",
                                         houseColor.bg, houseColor.text
                                       )}
                                       style={{ 
                                         gridColumn: gridPos.gridColumn, 
                                         gridRow: 1
                                       }}
                                     >
                                     <span className="truncate text-[9px] md:text-xs font-medium leading-tight">
                                       {booking.guest_name}
                                     </span>
                                   </div>
                                 </TooltipTrigger>
                                 <TooltipContent side="top" className="max-w-xs">
                                   <div className="space-y-1">
                                     <p className="font-medium">{booking.guest_name}</p>
                                     <p className="text-xs text-muted-foreground">
                                       {booking.check_in ? format(booking.check_in, 'dd.MM.yyyy') : ''} – {booking.check_out ? format(booking.check_out, 'dd.MM.yyyy') : ''}
                                     </p>
                                     <p className="text-xs">
                                       {nights} {nights === 1 ? t('gantt.night') : t('gantt.nights')} • {booking.house_name}
                                     </p>
                                   </div>
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>
                           );
                         })}

                         {/* Empty state */}
                         {bookings.length === 0 && (
                           <div 
                             className="flex items-center justify-center"
                             style={{ gridColumn: `1 / -1`, gridRow: 1 }}
                           >
                             <span className="text-[10px] md:text-xs text-muted-foreground">{t('gantt.noBookings')}</span>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 );
               })}

              {/* Empty state if no houses */}
              {houses.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  {t('gantt.noProperties')}
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    );
  };

  // Render List View (chronological, today + 60 days, linen + cleaning only)
  const renderListView = () => {
    const today = startOfDay(new Date());
    const filtered = events
      .filter(e => (e.type === 'linen' || e.type === 'cleaning') && !isAfter(today, e.date))
      .sort((a, b) => {
        const d = a.date.getTime() - b.date.getTime();
        if (d !== 0) return d;
        return getEventPriority(a.type) - getEventPriority(b.type);
      });

    // Group by day (yyyy-MM-dd)
    const groups: { date: Date; items: CalendarEvent[] }[] = [];
    filtered.forEach((e) => {
      const key = format(e.date, 'yyyy-MM-dd');
      const last = groups[groups.length - 1];
      if (last && format(last.date, 'yyyy-MM-dd') === key) {
        last.items.push(e);
      } else {
        groups.push({ date: e.date, items: [e] });
      }
    });

    if (groups.length === 0) {
      return (
        <div className="bg-background border rounded-lg p-8 text-center text-muted-foreground">
          {t('sidebar.noEvents')}
        </div>
      );
    }

    return (
      <div className="bg-background border rounded-lg divide-y">
        {groups.map((group) => {
          const isToday = isSameDay(group.date, new Date());
          return (
            <div key={group.date.toISOString()} className="p-3 md:p-4">
              <div className={cn(
                "flex items-center gap-2 mb-2 text-sm md:text-base font-semibold",
                isToday ? "text-primary" : "text-foreground"
              )}>
                <span>{format(group.date, 'EEEE, d. MMMM', { locale: dateLocale })}</span>
                {isToday && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                    {t('navigation.today')}
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                {group.items.map((event) => {
                  const houseColor = event.house_id ? getHouseColor(event.house_id) : null;
                  const IconCmp = event.type === 'linen' ? Shirt : Sparkles;
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => handleDayClick(group.date)}
                      className="w-full min-h-[44px] flex items-center gap-3 bg-card border rounded-xl p-3 text-left hover:bg-muted/40 transition-colors"
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                        event.type === 'linen'
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
                      )}>
                        <IconCmp className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 text-sm">
                        <span className="font-medium">{event.title}</span>
                        {event.house && <> · <span className="truncate">{event.house}</span></>}
                        {event.time && <> · <span className="text-muted-foreground">{event.time}</span></>}
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6 lg:space-y-0 lg:flex lg:gap-6">
        {/* Main Calendar */}
        <div className="flex-1">
          {/* Calendar Header */}
          <div className="mb-4 space-y-3">
            <h1 className="text-xl md:text-2xl font-bold">
              {view === 'week'
                ? `${format(weekStart, 'd. MMM', { locale: dateLocale })} - ${format(weekEnd, 'd. MMM yyyy', { locale: dateLocale })}`
                : view === 'list'
                ? format(new Date(), 'MMMM yyyy', { locale: dateLocale })
                : format(currentDate, 'MMMM yyyy', { locale: dateLocale })
              }
            </h1>

            {/* View switcher: Liste / Monat / Gantt — full-width segmented */}
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                onClick={() => setView('list')}
                className="flex-1 h-11 rounded-lg text-sm md:text-base font-medium"
              >
                Liste
              </Button>
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                onClick={() => setView('month')}
                className="flex-1 h-11 rounded-lg text-sm md:text-base font-medium"
              >
                {t('views.month')}
              </Button>
              <Button
                variant={view === 'gantt' ? 'default' : 'outline'}
                onClick={() => setView('gantt')}
                className="flex-1 h-11 rounded-lg text-sm md:text-base font-medium"
              >
                {t('views.gantt')}
              </Button>
            </div>
          </div>

          {/* Gantt-only nav row (since the in-card nav lives in month/week view) */}
          {view === 'gantt' && (
            <div className="flex items-center justify-end gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                className="h-9 w-9 p-0 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="h-9 px-4 rounded-full text-sm"
              >
                {t('navigation.today')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                className="h-9 w-9 p-0 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Gantt View */}
          {view === 'gantt' && renderGanttView()}

          {/* List View */}
          {view === 'list' && renderListView()}

          {/* Calendar Grid (Month/Week) */}
          {view !== 'gantt' && view !== 'list' && (
            <div className="bg-background border rounded-lg">
              {/* In-card header: house legend (left) + Today/arrows (right) */}
              <div className="flex items-center justify-between gap-2 p-3 md:p-4 border-b">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                  {houses.map((house) => {
                    const houseColor = getHouseColor(house.id);
                    return (
                      <div key={house.id} className="flex items-center gap-1.5">
                        <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", houseColor.bg)} />
                        <span className="text-xs md:text-sm font-medium text-muted-foreground">
                          {getHouseAbbreviation(house.name)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevious}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="h-8 px-3 rounded-full text-xs md:text-sm"
                  >
                    {t('navigation.today')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNext}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 border-b">

                {weekdaysShort.map((day) => (
                  <div key={day} className="p-2 md:p-4 text-center text-xs md:text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className={cn("grid", view === 'month' ? "grid-cols-7" : "grid-cols-7")}>
                {displayDays.map((date) => {
                  const allDayEvents = getEventsByDate(date);
                  const isToday = isSameDay(date, new Date());
                  const isCurrentMonth = view === 'month' ? format(date, 'M') === format(currentDate, 'M') : true;
                  const isOccupied = allDayEvents.some(e => e.type === 'occupied' || e.type === 'check-in' || e.type === 'check-out');
                  // Hide occupied from badges; sort remaining by priority so linen/cleaning are never clipped
                  const visibleEvents = allDayEvents
                    .filter(e => e.type !== 'occupied')
                    .sort((a, b) => getEventPriority(a.type) - getEventPriority(b.type));
                  const maxItems = 3;
                  const shownEvents = visibleEvents.slice(0, maxItems);
                  const hiddenCount = visibleEvents.length - shownEvents.length;

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        view === 'month' ? "min-h-[80px] md:min-h-[120px]" : "min-h-[120px] md:min-h-[150px]",
                        "p-1 md:p-2 border-r border-b last:border-r-0 cursor-pointer transition-colors",
                        "bg-muted/30 hover:bg-muted/50",
                        isOccupied && "bg-primary/15 hover:bg-primary/25",
                        isToday && "ring-2 ring-primary ring-inset",
                        !isCurrentMonth && "text-muted-foreground opacity-60"
                      )}
                      onClick={() => handleDayClick(date)}
                    >
                      <div className={cn(
                        "text-xs md:text-sm font-medium mb-1 md:mb-2",
                        isToday && "text-primary font-bold",
                        !isCurrentMonth && "text-muted-foreground"
                      )}>
                        {view === 'week' ? format(date, 'EEE d', { locale: dateLocale }) : format(date, 'd')}
                      </div>
                      <div className="space-y-0.5 md:space-y-1">
                        {shownEvents.map((event) => (
                          <Badge
                            key={event.id}
                            className={cn(
                              "text-[10px] md:text-xs px-1 md:px-2 py-0.5 md:py-1 block truncate cursor-pointer hover:opacity-80",
                              getEventColor(event)
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            {getEventDisplayText(event)}
                          </Badge>
                        ))}
                        {hiddenCount > 0 && (
                          <div className="text-[10px] md:text-xs text-muted-foreground">
                            {t('events.more', { count: hiddenCount })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Day details popup */}
      <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl p-5">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl font-bold">
              {selectedDate ? format(selectedDate, 'EEEE', { locale: dateLocale }) : ''}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedDate ? format(selectedDate, 'd. MMMM yyyy', { locale: dateLocale }) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 space-y-2">
            {selectedDate && getSelectedDateEvents().length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t('sidebar.noEvents')}
              </p>
            )}
            {selectedDate && getSelectedDateEvents().map((event) => {
              const IconCmp =
                event.type === 'cleaning' ? Sparkles :
                event.type === 'linen' ? Shirt :
                event.type === 'check-in' ? LogIn :
                event.type === 'check-out' ? LogOut :
                BedDouble;
              const statusLower = (event.status || '').toLowerCase();
              const statusDotColor =
                statusLower.includes('geliefert') || statusLower.includes('delivered') || statusLower.includes('abgeschlossen') || statusLower.includes('completed') || statusLower.includes('done')
                  ? 'bg-success'
                  : statusLower.includes('offen') || statusLower.includes('open') || statusLower.includes('pending')
                  ? 'bg-warning'
                  : 'bg-info';
              const iconHouseColor = event.house_id ? getHouseColor(event.house_id) : null;
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 bg-card border rounded-xl p-3"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    iconHouseColor ? cn(iconHouseColor.bg, iconHouseColor.text) : "bg-muted text-foreground"
                  )}>
                    <IconCmp className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {event.house || event.title}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span>{event.title}</span>
                      {event.time && <><span>·</span><span>{event.time}</span></>}
                      {event.status && (
                        <>
                          <span className={cn('inline-block w-1.5 h-1.5 rounded-full ml-1', statusDotColor)} />
                          <span>{event.status}</span>
                        </>
                      )}
                      {event.guest && <><span>·</span><span className="truncate">{event.guest}</span></>}
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
