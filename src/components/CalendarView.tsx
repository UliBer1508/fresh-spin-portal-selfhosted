// v7 - House colors and abbreviations
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

// House colors matching BookingCard.tsx
const HOUSE_COLORS = [
  { bg: 'bg-blue-500', text: 'text-white' },
  { bg: 'bg-purple-500', text: 'text-white' },
  { bg: 'bg-pink-500', text: 'text-white' },
  { bg: 'bg-green-500', text: 'text-white' },
  { bg: 'bg-orange-500', text: 'text-white' },
  { bg: 'bg-teal-500', text: 'text-white' },
  { bg: 'bg-indigo-500', text: 'text-white' },
  { bg: 'bg-rose-500', text: 'text-white' },
  { bg: 'bg-cyan-500', text: 'text-white' },
  { bg: 'bg-amber-500', text: 'text-white' },
  { bg: 'bg-emerald-500', text: 'text-white' },
  { bg: 'bg-violet-500', text: 'text-white' },
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
  const [view, setView] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
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

      // Fetch all houses for legend
      const { data: housesData } = await supabase
        .from('houses')
        .select('id, name')
        .order('name');

      if (housesData) {
        setHouses(housesData);
      }

      // Fetch bookings with house_id
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          id,
          guest_name,
          check_in,
          check_out,
          house_id,
          houses (name)
        `)
        .gte('check_out', startDate)
        .lte('check_in', endDate);

      // Fetch service tasks (cleaning) with house_id
      const { data: serviceTasks } = await supabase
        .from('service_tasks')
        .select(`
          id,
          scheduled_date,
          service_type,
          house_id,
          houses (name)
        `)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate)
        .eq('service_type', 'cleaning');

      // Fetch linen orders with house_id
      const { data: linenOrders } = await supabase
        .from('linen_orders')
        .select(`
          id,
          delivery_date,
          house_id,
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
    <div className="space-y-6">
      <div className="space-y-6 lg:space-y-0 lg:flex lg:gap-6">
        {/* Main Calendar */}
        <div className="flex-1">
          {/* Calendar Header */}
          <div className="mb-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                <h1 className="text-xl md:text-2xl font-bold">
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
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
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
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-4 lg:space-y-6">
          {/* Selected Date Events */}
          {selectedDate && (
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
              
              {/* Dynamic house colors for "Belegt" */}
              {houses.map((house) => {
                const houseColor = getHouseColor(house.id);
                return (
                  <div key={house.id} className="flex items-center space-x-2">
                    <div className={cn("w-3 h-3 md:w-4 md:h-4 rounded", houseColor.bg)}></div>
                    <span className="text-xs md:text-sm">{house.name} Belegt</span>
                  </div>
                );
              })}
              
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
