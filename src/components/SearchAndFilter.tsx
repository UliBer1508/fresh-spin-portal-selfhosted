// v9 - Multi-language support
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ViewSettings } from "@/components/ViewSettingsDialog";
import { Booking, LinenOrder } from "@/hooks/useBookings";
import { supabase } from "@/integrations/supabase/client";
import { getOrderStatusLabel } from "@/lib/constants";

interface LaundryStaff {
  id: string;
  name: string;
  is_active: boolean;
}

interface SearchAndFilterProps {
  bookings: Booking[];
  standaloneOrders?: LinenOrder[];
  onFilteredBookingsChange: (filteredBookings: Booking[]) => void;
  onFilteredStandaloneOrdersChange?: (filteredOrders: LinenOrder[]) => void;
  viewSettings: ViewSettings;
  onViewSettingsChange: (settings: ViewSettings) => void;
  showButtonOnMobile?: boolean;
  onShowButtonOnMobileChange?: (value: boolean) => void;
}

const SearchAndFilter = ({ 
  bookings, 
  standaloneOrders,
  onFilteredBookingsChange, 
  onFilteredStandaloneOrdersChange,
  viewSettings, 
  onViewSettingsChange,
  showButtonOnMobile,
  onShowButtonOnMobileChange
}: SearchAndFilterProps) => {
  const { t } = useTranslation('orders');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ausstehend");
  const [houseFilter, setHouseFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const [laundryStaff, setLaundryStaff] = useState<LaundryStaff[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
          case "offen":
            return status === "offen";
          case "ausstehend":
            return status === "ausstehend" || status === "pending";
          case "delivered":
            return status === "delivered" || status === "geliefert";
          case "cancelled":
            return status === "cancelled";
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

  // Filter für Standalone-Bestellungen
  const filteredStandaloneOrders = useMemo(() => {
    if (!standaloneOrders) return [];
    let filtered = [...standaloneOrders];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.houses?.name?.toLowerCase().includes(query) ||
        order.houses?.address?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => {
        const status = order.status?.toLowerCase();
        switch (statusFilter) {
          case "offen":
            return status === "offen";
          case "ausstehend":
            return status === "ausstehend" || status === "pending";
          case "delivered":
            return status === "delivered" || status === "geliefert";
          case "cancelled":
            return status === "cancelled";
          default:
            return true;
        }
      });
    }

    // House filter
    if (houseFilter !== "all") {
      filtered = filtered.filter(order =>
        order.houses?.name?.toLowerCase().replace(/\s+/g, '-') === houseFilter
      );
    }

    // Staff filter
    if (staffFilter !== "all") {
      filtered = filtered.filter(order =>
        order.assigned_staff_id === staffFilter
      );
    }

    return filtered;
  }, [standaloneOrders, searchQuery, statusFilter, houseFilter, staffFilter]);

  // Memoized callbacks um unnötige Re-renders zu vermeiden
  const stableBookingsCallback = useCallback(
    (bookings: Booking[]) => onFilteredBookingsChange(bookings),
    [onFilteredBookingsChange]
  );
  
  const stableStandaloneCallback = useCallback(
    (orders: LinenOrder[]) => onFilteredStandaloneOrdersChange?.(orders),
    [onFilteredStandaloneOrdersChange]
  );

  // Update parent component when filtered bookings change
  useEffect(() => {
    stableBookingsCallback(filteredBookings);
  }, [filteredBookings, stableBookingsCallback]);

  // Update parent component when filtered standalone orders change
  useEffect(() => {
    if (stableStandaloneCallback) {
      stableStandaloneCallback(filteredStandaloneOrders);
    }
  }, [filteredStandaloneOrders, stableStandaloneCallback]);

  // Count active filters
  const activeFiltersCount = [
    searchQuery.trim() !== "",
    statusFilter !== "pending", 
    houseFilter !== "all",
    timeFilter !== "all",
    staffFilter !== "all"
  ].filter(Boolean).length;

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      {/* Header mit Toggle */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔍</span>
          <span className="text-lg">🔽</span>
          <h3 className="font-semibold text-foreground">{t('common:actions.search')} & Filter</h3>
        </div>
        <span className="text-2xl transition-transform duration-200" style={{ transform: isFilterOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ⌃
        </span>
      </div>

      {/* Expandable Filter Section */}
      {isFilterOpen && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200 border-t border-border pt-4">
          {/* Suche */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-base">🔍</span>
              <span className="font-medium text-foreground">{t('common:actions.search')}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base">🔍</span>
              <Input
                placeholder={t('filter.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 text-base border-border focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-base">🔻</span>
              <span className="font-medium text-foreground">Filter</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full h-11">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">📅</span>
                    <SelectValue placeholder={t('filter.allStatus')} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-md z-[100]">
                  <SelectItem value="all">{t('filter.allStatus')}</SelectItem>
                  <SelectItem value="offen">{getOrderStatusLabel('offen')}</SelectItem>
                  <SelectItem value="ausstehend">{getOrderStatusLabel('ausstehend')}</SelectItem>
                  <SelectItem value="delivered">{getOrderStatusLabel('delivered')}</SelectItem>
                  <SelectItem value="cancelled">{getOrderStatusLabel('cancelled')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={staffFilter} onValueChange={setStaffFilter}>
                <SelectTrigger className="w-full h-11">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">👥</span>
                    <SelectValue placeholder={t('navigation:tabs.staff')} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-[100] max-h-60">
                  <SelectItem value="all">{t('filter.all')} {t('navigation:tabs.staff')}</SelectItem>
                  {laundryStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={houseFilter} onValueChange={setHouseFilter}>
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder={t('filter.all')} />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-md z-[100]">
                  <SelectItem value="all">{t('filter.all')}</SelectItem>
                  {uniqueHouses.map(house => (
                    <SelectItem key={house} value={house?.toLowerCase().replace(/\s+/g, '-') || ''}>
                      {house}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full h-11">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">🕐</span>
                    <SelectValue placeholder={t('filter.all')} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-md z-[100]">
                  <SelectItem value="all">{t('filter.all')}</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Zähler */}
          <div className="text-center text-sm text-muted-foreground pt-2">
            {filteredBookings.length} / {bookings.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
