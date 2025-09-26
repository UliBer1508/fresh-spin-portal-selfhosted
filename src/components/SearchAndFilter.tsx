import { useState, useEffect, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";

interface LaundryStaff {
  id: string;
  name: string;
  is_active: boolean;
}

interface SearchAndFilterProps {
  bookings: Booking[];
  onFilteredBookingsChange: (filteredBookings: Booking[]) => void;
}

const SearchAndFilter = ({ bookings, onFilteredBookingsChange }: SearchAndFilterProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [houseFilter, setHouseFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [laundryStaff, setLaundryStaff] = useState<LaundryStaff[]>([]);

  // Get unique houses from bookings
  const uniqueHouses = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    const houses = bookings.map(booking => booking.houses?.name).filter(Boolean);
    return [...new Set(houses)];
  }, [bookings]);

  // Load laundry staff
  useEffect(() => {
    const fetchLaundryStaff = async () => {
      try {
        const { data, error } = await supabase
          .from('laundry_staff')
          .select('id, name, is_active')
          .order('name');

        if (error) throw error;
        setLaundryStaff(data || []);
      } catch (error) {
        console.error('Error fetching laundry staff:', error);
      }
    };

    fetchLaundryStaff();
  }, []);

  // Filter logic
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.guest_name?.toLowerCase().includes(query) ||
        booking.houses?.name?.toLowerCase().includes(query) ||
        booking.houses?.address?.toLowerCase().includes(query) ||
        booking.id.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => {
        const linenOrder = booking.linen_orders?.[0];
        if (!linenOrder) return false;
        
        const status = linenOrder.status?.toLowerCase();
        
        switch (statusFilter) {
          case "pending":
            return status === "pending";
          case "in-progress":
            return status === "in_progress" || status === "assigned";
          case "completed":
            return status === "delivered" || status === "geliefert" || status === "completed";
          default:
            return true;
        }
      });
    }

    // House filter
    if (houseFilter !== "all") {
      filtered = filtered.filter(booking => 
        booking.houses?.name?.toLowerCase().replace(/\s+/g, '-') === houseFilter
      );
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(booking => {
        const checkIn = new Date(booking.check_in);
        switch (timeFilter) {
          case "today":
            return checkIn >= today && checkIn < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          case "week":
            return checkIn >= weekStart;
          case "month":
            return checkIn >= monthStart;
          default:
            return true;
        }
      });
    }

    // Staff filter
    if (staffFilter !== "all") {
      filtered = filtered.filter(booking => {
        const linenOrder = booking.linen_orders?.[0];
        return linenOrder?.assigned_staff_id === staffFilter;
      });
    }

    return filtered;
  }, [bookings, searchQuery, statusFilter, houseFilter, timeFilter, staffFilter]);

  // Update parent component when filtered bookings change
  useEffect(() => {
    onFilteredBookingsChange(filteredBookings);
  }, [filteredBookings, onFilteredBookingsChange]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
        <Input
          placeholder="Suche nach Gast, Haus oder Bestellnummer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base border-border focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Filter</span>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Alle Status" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-md z-50">
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="in-progress">In Bearbeitung</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
            </SelectContent>
          </Select>

          <Select value={houseFilter} onValueChange={setHouseFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Alle Häuser" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-md z-50">
              <SelectItem value="all">Alle Häuser</SelectItem>
              {uniqueHouses.map(house => (
                <SelectItem key={house} value={house?.toLowerCase().replace(/\s+/g, '-') || ''}>
                  {house}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Alle Zeiten" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-md z-50">
              <SelectItem value="all">Alle Zeiten</SelectItem>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
            </SelectContent>
          </Select>

          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Alle Wäschekräfte" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-60">
              <SelectItem value="all">Alle Wäschekräfte</SelectItem>
              {laundryStaff.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{staff.name}</span>
                    <Badge 
                      className={`ml-2 ${staff.is_active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
                      variant="outline"
                    >
                      {staff.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-primary bg-accent font-medium">
            {filteredBookings.length} von {bookings.length} Wäsche-Aufträgen
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;