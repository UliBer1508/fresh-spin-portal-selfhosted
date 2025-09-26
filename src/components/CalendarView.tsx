import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO, isWithinInterval, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  type: 'check-in' | 'check-out' | 'occupied' | 'cleaning' | 'linen';
  date: Date;
  title: string;
  house?: string;
  guest?: string;
}

interface Booking {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  houses?: { name: string };
}

interface ServiceTask {
  id: string;
  scheduled_date: string;
  service_type: string;
  houses?: { name: string };
}

interface LinenOrder {
  id: string;
  delivery_date: string;
  houses?: { name: string };
}

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const displayStart = view === 'month' ? monthStart : weekStart;
  const displayEnd = view === 'month' ? monthEnd : weekEnd;
  const displayDays = view === 'month' ? monthDays : weekDays;

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const startDate = displayStart.toISOString().split('T')[0];
      const endDate = displayEnd.toISOString().split('T')[0];

      // Fetch bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          guest_name,
          check_in,
          check_out,
          houses (name)
        `)
        .gte('check_out', startDate)
        .lte('check_in', endDate);

      // Fetch service tasks (cleaning)
      const { data: serviceTasks } = await supabase
        .from('service_tasks')
        .select(`
          id,
          scheduled_date,
          service_type,
          houses (name)
        `)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .eq('service_type', 'cleaning');

      // Fetch linen orders
      const { data: linenOrders } = await supabase
        .from('linen_orders')
        .select(`
          id,
          delivery_date,
          houses (name)
        `)
        .gte('delivery_date', startDate)
        .lte('delivery_date', endDate);

      const calendarEvents: CalendarEvent[] = [];

      // Process bookings
      bookings?.forEach((booking: Booking) => {
        const checkInDate = parseISO(booking.check_in);
        const checkOutDate = parseISO(booking.check_out);

        // Add check-in event
        calendarEvents.push({
          id: `checkin-${booking.id}`,
          type: 'check-in',
          date: checkInDate,
          title: 'Check-in',
          house: booking.houses?.name,
          guest: booking.guest_name
        });

        // Add check-out event
        calendarEvents.push({
          id: `checkout-${booking.id}`,
          type: 'check-out',
          date: checkOutDate,
          title: 'Check-out',
          house: booking.houses?.name,
          guest: booking.guest_name
        });

        // Add occupied days between check-in and check-out
        const occupiedDays = eachDayOfInterval({ start: checkInDate, end: checkOutDate });
        occupiedDays.forEach((day, index) => {
          if (index > 0 && index < occupiedDays.length - 1) { // Skip first and last day
            calendarEvents.push({
              id: `occupied-${booking.id}-${format(day, 'yyyy-MM-dd')}`,
              type: 'occupied',
              date: day,
              title: 'Belegt',
              house: booking.houses?.name,
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
          house: task.houses?.name
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
            house: order.houses?.name
          });
        }
      });

      setEvents(calendarEvents);
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

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'check-in':
        return 'bg-success text-success-foreground';
      case 'check-out':
        return 'bg-destructive text-destructive-foreground';
      case 'occupied':
        return 'bg-warning text-warning-foreground';
      case 'cleaning':
        return 'bg-info text-info-foreground';
      case 'linen':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getEventIconColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'check-in':
        return 'bg-success';
      case 'check-out':
        return 'bg-destructive';
      case 'occupied':
        return 'bg-warning';
      case 'cleaning':
        return 'bg-info';
      case 'linen':
        return 'bg-purple-500';
      default:
        return 'bg-muted';
    }
  };

  const goToPrevious = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const goToNext = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex gap-6">
      {/* Main Calendar */}
      <div className="flex-1">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">
              {view === 'month' 
                ? format(currentDate, 'MMMM yyyy', { locale: de })
                : `${format(weekStart, 'd. MMM', { locale: de })} - ${format(weekEnd, 'd. MMM yyyy', { locale: de })}`
              }
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Heute
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
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
            >
              Monat
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Woche
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-background border rounded-lg">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
              <div key={day} className="p-4 text-center text-sm font-medium text-muted-foreground">
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
                    view === 'month' ? "min-h-[120px]" : "min-h-[150px]",
                    "p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-accent/10",
                    isToday && "bg-accent/20",
                    !isCurrentMonth && "text-muted-foreground bg-muted/20"
                  )}
                  onClick={() => handleDayClick(date)}
                >
                  <div className={cn(
                    "text-sm font-medium mb-2",
                    isToday && "text-primary font-bold",
                    !isCurrentMonth && "text-muted-foreground"
                  )}>
                    {view === 'week' ? format(date, 'EEE d', { locale: de }) : format(date, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, view === 'week' ? 5 : 3).map((event) => (
                      <Badge
                        key={event.id}
                        className={cn(
                          "text-xs px-2 py-1 block truncate cursor-pointer hover:opacity-80",
                          getEventColor(event.type)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.title}
                        {view === 'week' && event.guest && (
                          <span className="block text-xs opacity-75">
                            {event.guest}
                          </span>
                        )}
                      </Badge>
                    ))}
                    {dayEvents.length > (view === 'week' ? 5 : 3) && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - (view === 'week' ? 5 : 3)} weitere
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-6">
        {/* Selected Date Events */}
        {selectedDate && (
          <div className="bg-background border rounded-lg p-4">
            <h3 className="font-medium mb-3">
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
                      <div className={cn("w-3 h-3 rounded", getEventIconColor(event.type))}></div>
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
        <div className="bg-background border rounded-lg p-4">
          <h3 className="font-medium mb-3">Datum auswählen</h3>
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
        <div className="bg-background border rounded-lg p-4">
          <h3 className="font-medium mb-3">Legende</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-success rounded"></div>
              <span className="text-sm">Check-in</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-destructive rounded"></div>
              <span className="text-sm">Check-out</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-warning rounded"></div>
              <span className="text-sm">Belegt</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-info rounded"></div>
              <span className="text-sm">Reinigung</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm">Wäsche</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;