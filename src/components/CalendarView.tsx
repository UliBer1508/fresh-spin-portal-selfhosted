// v8 - Tourist filter + Gantt chart view
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, differenceInDays, isWithinInterval } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// House colors matching BookingCard.tsx
const HOUSE_COLORS = [
  { bg: 'bg-blue-500', text: 'text-white', hex: '#3b82f6' },
  { bg: 'bg-purple-500', text: 'text-white', hex: '#a855f7' },
  { bg: 'bg-pink-500', text: 'text-white', hex: '#ec4899' },
  { bg: 'bg-green-500', text: 'text-white', hex: '#22c55e' },
  { bg: 'bg-orange-500', text: 'text-white', hex: '#f97316' },
  { bg: 'bg-teal-500', text: 'text-white', hex: '#14b8a6' },
  { bg: 'bg-indigo-500', text: 'text-white', hex: '#6366f1' },
  { bg: 'bg-rose-500', text: 'text-white', hex: '#f43f5e' },
  { bg: 'bg-cyan-500', text: 'text-white', hex: '#06b6d4' },
  { bg: 'bg-amber-500', text: 'text-white', hex: '#f59e0b' },
  { bg: 'bg-emerald-500', text: 'text-white', hex: '#10b981' },
  { bg: 'bg-violet-500', text: 'text-white', hex: '#8b5cf6' },
];

interface CalendarEvent {
  id: string;
  type: 'check-in' | 'check-out' | 'occupied' | 'cleaning' | 'linen';
  date: Date;
  title: string;
  house?: string;
  house_id?: string;
  guest?: string;
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
  check_in: Date;
  check_out: Date;
  house_id: string;
  house_name: string;
}

// Get consistent color for a house based on its ID
const getHouseColor = (houseId: string) => {
  if (!houseId) return HOUSE_COLORS[0];
  const hash = houseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return HOUSE_COLORS[hash % HOUSE_COLORS.length];
};

// Get house name abbreviation (e.g., "Wald Chalet" → "WC")
const getHouseAbbreviation = (houseName: string) => {
  if (!houseName) return '';
  const words = houseName.split(' ').filter(w => w.length > 0);
  if (words.length === 1) return houseName.substring(0, 3).toUpperCase();
  return words.map(w => w[0]).join('').toUpperCase().substring(0, 3);
};

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [view, setView] = useState<'month' | 'week' | 'gantt'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [ganttBookings, setGanttBookings] = useState<GanttBooking[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const startDate = displayStart.toISOString().split('T')[0];
      const endDate = displayEnd.toISOString().split('T')[0];

      // Fetch only tourist houses for legend
      const { data: housesData } = await supabase
        .from('houses')
        .select('id, name')
        .eq('rental_type', 'tourist')
        .order('name');

      if (housesData) {
        setHouses(housesData);
      }

      // Fetch bookings with house_id - only tourist rentals
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          guest_name,
          check_in,
          check_out,
          house_id,
          houses!inner (name, rental_type)
        `)
        .eq('houses.rental_type', 'tourist')
        .gte('check_out', startDate)
        .lte('check_in', endDate);

      // Fetch service tasks (cleaning) with house_id - only tourist rentals
      const { data: serviceTasks } = await supabase
        .from('service_tasks')
        .select(`
          id,
          scheduled_date,
          service_type,
          house_id,
          houses!inner (name, rental_type)
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
          house_id,
          houses!inner (name, rental_type)
        `)
        .eq('houses.rental_type', 'tourist')
        .gte('delivery_date', startDate)
        .lte('delivery_date', endDate);

      const calendarEvents: CalendarEvent[] = [];
      const ganttData: GanttBooking[] = [];

      // Process bookings
      bookings?.forEach((booking: Booking) => {
        const checkInDate = parseISO(booking.check_in);
        const checkOutDate = parseISO(booking.check_out);

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
          title: 'Check-in',
          house: booking.houses?.name,
          house_id: booking.house_id,
          guest: booking.guest_name
        });

        // Add check-out event
        calendarEvents.push({
          id: `checkout-${booking.id}`,
          type: 'check-out',
          date: checkOutDate,
          title: 'Check-out',
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
              title: 'Belegt',
              house: booking.houses?.name,
              house_id: booking.house_id,
              guest: booking.guest_name
            });
          }
        });
      });

      // Process service tasks (cleaning)
      serviceTasks?.forEach((task: ServiceTask) => {
        calendarEvents.push({
          id: `cleaning-${task.id}`,
          type: 'cleaning',
          date: parseISO(task.scheduled_date),
          title: 'Reinigung',
          house: task.houses?.name,
          house_id: task.house_id
        });
      });

      // Process linen orders
      linenOrders?.forEach((order: LinenOrder) => {
        if (order.delivery_date) {
          calendarEvents.push({
            id: `linen-${order.id}`,
            type: 'linen',
            date: parseISO(order.delivery_date),
            title: 'Wäsche',
            house: order.houses?.name,
            house_id: order.house_id
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
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
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
      return event.house || 'Belegt';
    }
    
    // For other types, show type + house abbreviation
    const typeText = event.title;
    return abbr ? `${typeText} • ${abbr}` : typeText;
  };

  const goToPrevious = () => {
    if (view === 'month' || view === 'gantt') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const goToNext = () => {
    if (view === 'month' || view === 'gantt') {
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

  // Calculate Gantt bar position and width
  const getGanttBarStyle = (booking: GanttBooking) => {
    const totalDays = monthDays.length;
    const startOffset = Math.max(0, differenceInDays(booking.check_in, monthStart));
    const endOffset = Math.min(totalDays - 1, differenceInDays(booking.check_out, monthStart));
    const duration = endOffset - startOffset + 1;
    
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  // Render Gantt Chart View
  const renderGanttView = () => {
    const dayWidth = 'minmax(28px, 1fr)';
    const gridCols = `repeat(${monthDays.length}, ${dayWidth})`;

    return (
      <div className="bg-background border rounded-lg overflow-hidden">
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            {/* Header with days */}
            <div className="flex border-b sticky top-0 bg-background z-10">
              <div className="w-32 md:w-40 shrink-0 p-2 md:p-3 font-medium text-sm border-r bg-muted/50">
                Unterkunft
              </div>
              <div className="flex-1 grid" style={{ gridTemplateColumns: gridCols }}>
                {monthDays.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "p-1 text-center text-[10px] md:text-xs border-r last:border-r-0",
                        isToday && "bg-primary/20 font-bold",
                        isWeekend && "bg-muted/30"
                      )}
                    >
                      <div className="font-medium">{format(day, 'd')}</div>
                      <div className="text-muted-foreground hidden md:block">{format(day, 'EEE', { locale: de })}</div>
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
                <div key={house.id} className="flex border-b last:border-b-0 min-h-[50px] md:min-h-[60px]">
                  {/* House name */}
                  <div className="w-32 md:w-40 shrink-0 p-2 md:p-3 border-r bg-muted/20 flex items-center">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full shrink-0", houseColor.bg)} />
                      <span className="text-xs md:text-sm font-medium truncate">{house.name}</span>
                    </div>
                  </div>

                  {/* Timeline with bookings */}
                  <div className="flex-1 relative">
                    {/* Background grid */}
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: gridCols }}>
                      {monthDays.map((day) => {
                        const isToday = isSameDay(day, new Date());
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        return (
                          <div
                            key={day.toISOString()}
                            className={cn(
                              "border-r last:border-r-0 h-full",
                              isToday && "bg-primary/10",
                              isWeekend && "bg-muted/20"
                            )}
                          />
                        );
                      })}
                    </div>

                    {/* Booking bars */}
                    <div className="relative h-full py-2 px-1">
                      {bookings.map((booking) => {
                        const style = getGanttBarStyle(booking);
                        const nights = differenceInDays(booking.check_out, booking.check_in);
                        
                        return (
                          <TooltipProvider key={booking.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    "absolute top-1/2 -translate-y-1/2 h-7 md:h-8 rounded-md flex items-center px-1 md:px-2 cursor-pointer hover:opacity-90 transition-opacity shadow-sm",
                                    houseColor.bg, houseColor.text
                                  )}
                                  style={{ left: style.left, width: style.width, minWidth: '24px' }}
                                >
                                  <span className="text-[10px] md:text-xs font-medium truncate">
                                    {booking.guest_name}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-medium">{booking.guest_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(booking.check_in, 'd. MMM', { locale: de })} - {format(booking.check_out, 'd. MMM yyyy', { locale: de })}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {nights} {nights === 1 ? 'Nacht' : 'Nächte'} • {booking.house_name}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}

                      {/* Empty state */}
                      {bookings.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Keine Buchungen</span>
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
                Keine touristisch vermieteten Unterkünfte gefunden.
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6 lg:space-y-0 lg:flex lg:gap-6">
        {/* Main Calendar */}
        <div className="flex-1">
          {/* Calendar Header */}
          <div className="mb-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                <h1 className="text-xl md:text-2xl font-bold">
                  {view === 'week' 
                    ? `${format(weekStart, 'd. MMM', { locale: de })} - ${format(weekEnd, 'd. MMM yyyy', { locale: de })}`
                    : format(currentDate, 'MMMM yyyy', { locale: de })
                  }
                </h1>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevious}
                    className="h-8 px-2 md:h-9 md:px-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="h-8 px-2 text-xs md:h-9 md:px-3 md:text-sm"
                  >
                    Heute
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNext}
                    className="h-8 px-2 md:h-9 md:px-3"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={view === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('month')}
                  className="h-8 px-2 text-xs md:h-9 md:px-3 md:text-sm"
                >
                  Monat
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('week')}
                  className="h-8 px-2 text-xs md:h-9 md:px-3 md:text-sm"
                >
                  Woche
                </Button>
                <Button
                  variant={view === 'gantt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('gantt')}
                  className="h-8 px-2 text-xs md:h-9 md:px-3 md:text-sm"
                >
                  Gantt
                </Button>
              </div>
            </div>
          </div>

          {/* Gantt View */}
          {view === 'gantt' && renderGanttView()}

          {/* Calendar Grid (Month/Week) */}
          {view !== 'gantt' && (
            <div className="bg-background border rounded-lg">
              {/* Days of week header */}
              <div className="grid grid-cols-7 border-b">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
                  <div key={day} className="p-2 md:p-4 text-center text-xs md:text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className={cn("grid", view === 'month' ? "grid-cols-7" : "grid-cols-7")}>
                {displayDays.map((date) => {
                  const dayEvents = getEventsByDate(date);
                  const isToday = isSameDay(date, new Date());
                  const isCurrentMonth = view === 'month' ? format(date, 'M') === format(currentDate, 'M') : true;

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        view === 'month' ? "min-h-[80px] md:min-h-[120px]" : "min-h-[120px] md:min-h-[150px]",
                        "p-1 md:p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-accent/10",
                        isToday && "bg-accent/20",
                        !isCurrentMonth && "text-muted-foreground bg-muted/20"
                      )}
                      onClick={() => handleDayClick(date)}
                    >
                      <div className={cn(
                        "text-xs md:text-sm font-medium mb-1 md:mb-2",
                        isToday && "text-primary font-bold",
                        !isCurrentMonth && "text-muted-foreground"
                      )}>
                        {view === 'week' ? format(date, 'EEE d', { locale: de }) : format(date, 'd')}
                      </div>
                      <div className="space-y-0.5 md:space-y-1">
                        {dayEvents.slice(0, view === 'week' ? 3 : 2).map((event) => (
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
                        {dayEvents.length > (view === 'week' ? 3 : 2) && (
                          <div className="text-[10px] md:text-xs text-muted-foreground">
                            +{dayEvents.length - (view === 'week' ? 3 : 2)} weitere
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

        {/* Sidebar - hide in Gantt view on mobile */}
        <div className={cn("w-full lg:w-80 space-y-4 lg:space-y-6", view === 'gantt' && "hidden lg:block")}>
          {/* Selected Date Events */}
          {selectedDate && view !== 'gantt' && (
            <div className="bg-background border rounded-lg p-3 md:p-4">
              <h3 className="font-medium mb-3 text-sm md:text-base">
                Termine für {format(selectedDate, 'd. MMMM', { locale: de })}
              </h3>
              {getSelectedDateEvents().length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Keine Termine für diesen Tag.
                </p>
              ) : (
                <div className="space-y-3">
                  {getSelectedDateEvents().map((event) => (
                    <div key={event.id} className="border-l-4 border-l-primary pl-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className={cn("w-3 h-3 rounded", getEventIconColor(event))}></div>
                        <span className="font-medium text-sm">{event.title}</span>
                      </div>
                      {event.guest && (
                        <p className="text-sm text-muted-foreground">
                          Gast: {event.guest}
                        </p>
                      )}
                      {event.house && (
                        <p className="text-sm text-muted-foreground">
                          {event.house}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Date Picker */}
          <div className="bg-background border rounded-lg p-3 md:p-4">
            <h3 className="font-medium mb-3 text-sm md:text-base">Datum auswählen</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Wählen Sie ein Datum aus dem Kalender
            </p>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP', { locale: de }) : 'Datum wählen'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Legend */}
          <div className="bg-background border rounded-lg p-3 md:p-4">
            <h3 className="font-medium mb-3 text-sm md:text-base">Legende</h3>
            <div className="space-y-2">
              {view !== 'gantt' && (
                <>
                  {/* Check-in */}
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-success rounded"></div>
                    <span className="text-xs md:text-sm">Check-in</span>
                  </div>
                  {/* Check-out */}
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-destructive rounded"></div>
                    <span className="text-xs md:text-sm">Check-out</span>
                  </div>
                </>
              )}
              
              {/* Dynamic house colors */}
              {houses.map((house) => {
                const houseColor = getHouseColor(house.id);
                return (
                  <div key={house.id} className="flex items-center space-x-2">
                    <div className={cn("w-3 h-3 md:w-4 md:h-4 rounded", houseColor.bg)}></div>
                    <span className="text-xs md:text-sm">{house.name}</span>
                  </div>
                );
              })}
              
              {view !== 'gantt' && (
                <>
                  {/* Reinigung */}
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-info rounded"></div>
                    <span className="text-xs md:text-sm">Reinigung</span>
                  </div>
                  {/* Wäsche */}
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-purple-500 rounded"></div>
                    <span className="text-xs md:text-sm">Wäsche</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
