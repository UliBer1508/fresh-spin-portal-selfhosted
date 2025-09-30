import React, { useState, useEffect } from "react";
// v7 - Emojis statt Icons
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LaundryStaff {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  hourly_rate?: number;
  availability_days?: string[];
  quality_rating: number;
  total_orders: number;
  completed_orders: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const LaundryStaffManagement = () => {
  const [staff, setStaff] = useState<LaundryStaff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<LaundryStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "orders">("name");

  const dayLabels = {
    monday: 'mo',
    tuesday: 'di',
    wednesday: 'mi',
    thursday: 'do',
    friday: 'fr',
    saturday: 'sa',
    sunday: 'so'
  };

  useEffect(() => {
    fetchStaff();
    
    // Real-time subscription für automatische Updates bei Änderungen an linen_orders
    const channel = supabase
      .channel('laundry-staff-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'linen_orders'
        },
        () => {
          console.log('Linen order change detected, updating staff counts...');
          fetchStaff();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterAndSortStaff();
  }, [staff, searchQuery, statusFilter, sortBy]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      
      // Fetch staff with dynamic order counts
      const { data: staffData, error: staffError } = await supabase
        .from('laundry_staff')
        .select('*')
        .order('name');

      if (staffError) throw staffError;

      // Get order counts for each staff member
      const staffWithCounts = await Promise.all(
        (staffData || []).map(async (staffMember) => {
          // Get total orders assigned to this staff member
          const { count: totalOrders } = await supabase
            .from('linen_orders')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_staff_id', staffMember.id);

          // Get completed orders for this staff member
          const { count: completedOrders } = await supabase
            .from('linen_orders')
            .select('*', { count: 'exact', head: true })
            .eq('assigned_staff_id', staffMember.id)
            .in('status', ['delivered', 'geliefert', 'completed']);

          return {
            ...staffMember,
            total_orders: totalOrders || 0,
            completed_orders: completedOrders || 0,
          };
        })
      );

      setStaff(staffWithCounts);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Fehler beim Laden der Wäschekräfte');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStaff = () => {
    let filtered = staff.filter(person => {
      const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          person.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          person.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && person.is_active) ||
                           (statusFilter === "inactive" && !person.is_active);

      return matchesSearch && matchesStatus;
    });

    // Sort staff
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.quality_rating - a.quality_rating;
        case 'orders':
          return b.total_orders - a.total_orders;
        default:
          return 0;
      }
    });

    setFilteredStaff(filtered);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortBy("name");
  };

  const getStats = () => {
    const total = staff.length;
    const active = staff.filter(s => s.is_active).length;
    const avgRating = staff.length > 0 
      ? staff.reduce((sum, s) => sum + s.quality_rating, 0) / staff.length 
      : 0;
    const totalOrders = staff.reduce((sum, s) => sum + s.total_orders, 0);

    return { total, active, avgRating: avgRating.toFixed(1), totalOrders };
  };

  const stats = getStats();

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Wäschekraft löschen möchten?')) {
      try {
        const { error } = await supabase
          .from('laundry_staff')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast.success('Wäschekraft erfolgreich gelöscht');
        fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        toast.error('Fehler beim Löschen der Wäschekraft');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Lade Wäschekräfte...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Wäschekräfte verwalten
        </h1>
        <p className="text-muted-foreground text-lg">
          Übersicht und Verwaltung aller Wäschekräfte
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktiv</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bewertung</CardTitle>
            <span className="text-2xl">⭐</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.avgRating}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aufträge</CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔍</span>
            <span className="text-lg">🔽</span>
            <CardTitle className="text-lg">Suche & Filter</CardTitle>
            <Badge variant="secondary" className="bg-success text-success-foreground">
              {filteredStaff.filter(s => s.is_active).length} aktiv
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base">🔍</span>
              <Input
                placeholder="Suche nach Name, E-Mail oder Adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: "name" | "rating" | "orders") => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="name">Nach Name</SelectItem>
                <SelectItem value="rating">Nach Bewertung</SelectItem>
                <SelectItem value="orders">Nach Aufträgen</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => {
              if (value) {
                const selectedStaff = staff.find(s => s.id === value);
                if (selectedStaff) {
                  setFilteredStaff([selectedStaff]);
                  setSearchQuery(selectedStaff.name);
                }
              }
            }}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Wäschekraft auswählen" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-60">
                {staff.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{person.name}</span>
                      <Badge 
                        className={`ml-2 ${person.is_active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
                        variant="outline"
                      >
                        {person.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters}>
              Alle zeigen
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredStaff.length} von {staff.length} Wäschekräften
          </p>
        </CardContent>
      </Card>

      {/* Staff Cards */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Keine Wäschekräfte gefunden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((person) => (
            <Card key={person.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{person.name}</CardTitle>
                    <Badge className={person.is_active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                      {person.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-base">⭐</span>
                    <span className="text-sm font-medium">{person.quality_rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {person.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-base">📧</span>
                    <span className="text-muted-foreground">{person.email}</span>
                  </div>
                )}
                
                {person.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-base">📞</span>
                    <span className="text-muted-foreground">{person.phone}</span>
                  </div>
                )}

                {person.address && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-base">📍</span>
                    <span className="text-muted-foreground">{person.address}</span>
                  </div>
                )}

                {person.hourly_rate && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-base">💰</span>
                    <span className="text-muted-foreground">{person.hourly_rate.toFixed(2)} €/Std</span>
                  </div>
                )}

                {/* Statistics */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold">{person.completed_orders}</div>
                    <div className="text-xs text-muted-foreground">Abgeschlossen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{person.total_orders}</div>
                    <div className="text-xs text-muted-foreground">Aufträge gesamt</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{person.total_orders - person.completed_orders}</div>
                    <div className="text-xs text-muted-foreground">Aktiv</div>
                  </div>
                </div>

                {/* Available Days */}
                {person.availability_days && person.availability_days.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Verfügbare Tage:</div>
                    <div className="flex flex-wrap gap-1">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <Badge
                          key={day}
                          variant={person.availability_days?.includes(day) ? "default" : "outline"}
                          className="text-xs"
                        >
                          {dayLabels[day as keyof typeof dayLabels]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-3 border-t space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <span className="text-base mr-1">✏️</span>
                    Bearbeiten
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteStaff(person.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <span className="text-base">🗑️</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LaundryStaffManagement;