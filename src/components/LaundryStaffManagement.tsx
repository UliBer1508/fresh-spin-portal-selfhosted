// v9 - Edit functionality added
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditLaundryStaffDialog } from "@/components/dialogs/EditLaundryStaffDialog";

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
  const [editingStaff, setEditingStaff] = useState<LaundryStaff | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

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
      
      // Optimiert: Eine Query für Staff + parallele Batch-Query für alle Order-Counts
      const [staffResult, ordersResult] = await Promise.all([
        supabase.from('laundry_staff').select('*').order('name'),
        supabase.from('linen_orders').select('assigned_staff_id, status')
      ]);

      if (staffResult.error) throw staffResult.error;
      
      const staffData = staffResult.data || [];
      const ordersData = ordersResult.data || [];
      
      // Aggregiere Order-Counts clientseitig (vermeidet N+1)
      const orderCounts = ordersData.reduce((acc, order) => {
        const staffId = order.assigned_staff_id;
        if (!staffId) return acc;
        
        if (!acc[staffId]) {
          acc[staffId] = { total: 0, completed: 0 };
        }
        acc[staffId].total++;
        
        const status = order.status?.toLowerCase();
        if (status === 'delivered' || status === 'geliefert' || status === 'completed') {
          acc[staffId].completed++;
        }
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);

      const staffWithCounts = staffData.map((staffMember) => ({
        ...staffMember,
        total_orders: orderCounts[staffMember.id]?.total || 0,
        completed_orders: orderCounts[staffMember.id]?.completed || 0,
      }));

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

  const handleEditStaff = (person: LaundryStaff) => {
    // requestAnimationFrame verhindert Touch-Event-Konflikte auf Mobile
    requestAnimationFrame(() => {
      setIsCreatingNew(false);
      setEditingStaff(person);
      setEditDialogOpen(true);
    });
  };

  const handleAddNewStaff = () => {
    setEditingStaff(null);
    setIsCreatingNew(true);
    setEditDialogOpen(true);
  };

  const handleCreateStaff = async (newData: Partial<LaundryStaff>) => {
    try {
      const { error } = await supabase
        .from('laundry_staff')
        .insert({
          name: newData.name,
          email: newData.email,
          phone: newData.phone,
          address: newData.address,
          hourly_rate: newData.hourly_rate,
          quality_rating: newData.quality_rating || 0,
          is_active: newData.is_active ?? true,
          availability_days: newData.availability_days || [],
          notes: newData.notes,
        });

      if (error) throw error;
      
      toast.success('Neue Wäschekraft erfolgreich erstellt');
      setIsCreatingNew(false);
      fetchStaff();
    } catch (error) {
      console.error('Error creating staff:', error);
      toast.error('Fehler beim Erstellen der Wäschekraft');
    }
  };

  const handleUpdateStaff = async (updatedData: Partial<LaundryStaff>) => {
    if (!editingStaff) return;

    try {
      const { error } = await supabase
        .from('laundry_staff')
        .update(updatedData)
        .eq('id', editingStaff.id);

      if (error) throw error;
      
      toast.success('Wäschekraft erfolgreich aktualisiert');
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('Fehler beim Aktualisieren der Wäschekraft');
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
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex justify-between items-start sm:items-center">
        <div className="text-center sm:text-left">
          <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Wäschekräfte verwalten
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Übersicht und Verwaltung aller Wäschekräfte
          </p>
        </div>
        <Button onClick={handleAddNewStaff} className="h-8 sm:h-10 text-xs sm:text-sm">
          <span className="mr-1">➕</span>
          <span className="hidden sm:inline">Neue Wäschekraft</span>
          <span className="sm:hidden">Neu</span>
        </Button>
      </div>

      {/* Statistics Cards - Ultra compact on mobile */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-4">
        <Card>
          <CardContent className="p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:pb-2">
              <div className="hidden sm:block text-xs sm:text-sm font-medium text-muted-foreground">Gesamt</div>
              <span className="text-base sm:text-2xl">👥</span>
            </div>
            <div className="text-base sm:text-2xl font-bold mt-1 sm:mt-0">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:pb-2">
              <div className="hidden sm:block text-xs sm:text-sm font-medium text-muted-foreground">Aktiv</div>
              <span className="text-base sm:text-2xl">✅</span>
            </div>
            <div className="text-base sm:text-2xl font-bold text-success mt-1 sm:mt-0">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:pb-2">
              <div className="hidden sm:block text-xs sm:text-sm font-medium text-muted-foreground">Bewertung</div>
              <span className="text-base sm:text-2xl">⭐</span>
            </div>
            <div className="text-base sm:text-2xl font-bold text-warning mt-1 sm:mt-0">{stats.avgRating}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:pb-2">
              <div className="hidden sm:block text-xs sm:text-sm font-medium text-muted-foreground">Aufträge</div>
              <span className="text-base sm:text-2xl">📅</span>
            </div>
            <div className="text-base sm:text-2xl font-bold text-info mt-1 sm:mt-0">{stats.totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter - Compact on mobile */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm sm:text-lg">🔍</span>
            <CardTitle className="text-sm sm:text-lg">Suche & Filter</CardTitle>
            <Badge variant="secondary" className="bg-success text-success-foreground text-[10px] sm:text-xs">
              {filteredStaff.filter(s => s.is_active).length} aktiv
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3 pt-0 sm:p-6 sm:pt-0">
          {/* Search field */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-xs sm:text-base">🔍</span>
            <Input
              placeholder="Suche nach Name, E-Mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 sm:pl-10 text-xs sm:text-base h-8 sm:h-10"
            />
          </div>
          
          {/* Filters in 2 columns on mobile */}
          <div className="grid grid-cols-2 gap-2">
            <Select value={statusFilter} onValueChange={(value: "all" | "active" | "inactive") => setStatusFilter(value)}>
              <SelectTrigger className="text-xs sm:text-base h-8 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: "name" | "rating" | "orders") => setSortBy(value)}>
              <SelectTrigger className="text-xs sm:text-base h-8 sm:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="name">Nach Name</SelectItem>
                <SelectItem value="rating">Nach Bewertung</SelectItem>
                <SelectItem value="orders">Nach Aufträgen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Staff picker - hidden on mobile */}
          <div className="hidden sm:flex gap-2">
            <Select onValueChange={(value) => {
              if (value) {
                const selectedStaff = staff.find(s => s.id === value);
                if (selectedStaff) {
                  setFilteredStaff([selectedStaff]);
                  setSearchQuery(selectedStaff.name);
                }
              }
            }}>
              <SelectTrigger className="flex-1 text-sm sm:text-base h-8 sm:h-10">
                <SelectValue placeholder="Wäschekraft auswählen" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50 max-h-60">
                {staff.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm sm:text-base">{person.name}</span>
                      <Badge 
                        className={`ml-2 text-xs ${person.is_active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
                        variant="outline"
                      >
                        {person.is_active ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters} className="text-xs sm:text-base h-8 sm:h-10">
              Alle zeigen
            </Button>
          </div>

          {/* Reset button on mobile */}
          <Button 
            variant="outline" 
            onClick={resetFilters} 
            className="w-full text-xs h-8 sm:hidden"
          >
            Alle zeigen
          </Button>

          <p className="text-[10px] sm:text-sm text-muted-foreground">
            {filteredStaff.length} von {staff.length} Wäschekräften
          </p>
        </CardContent>
      </Card>

      {/* Staff Cards - Compact on mobile */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground text-sm">Keine Wäschekräfte gefunden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredStaff.map((person) => (
            <Card key={person.id} className="relative">
              <CardHeader className="p-3 sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg">{person.name}</CardTitle>
                    <Badge className={`text-[10px] sm:text-xs ${person.is_active ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                      {person.is_active ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm sm:text-base">⭐</span>
                    <span className="text-xs sm:text-sm font-medium">{person.quality_rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3 p-3 pt-0 sm:p-6 sm:pt-0">
                {person.email && (
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                    <span className="text-sm sm:text-base">📧</span>
                    <span className="text-muted-foreground truncate">{person.email}</span>
                  </div>
                )}
                
                {person.phone && (
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                    <span className="text-sm sm:text-base">📞</span>
                    <span className="text-muted-foreground">{person.phone}</span>
                  </div>
                )}

                {person.address && (
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                    <span className="text-sm sm:text-base">📍</span>
                    <span className="text-muted-foreground truncate">{person.address}</span>
                  </div>
                )}

                {person.hourly_rate && (
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm">
                    <span className="text-sm sm:text-base">💰</span>
                    <span className="text-muted-foreground">{person.hourly_rate.toFixed(2)} €/Std</span>
                  </div>
                )}

                {/* Statistics - Compact on mobile */}
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold">{person.completed_orders}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Abgeschlossen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold">{person.total_orders}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Gesamt</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold">{person.total_orders - person.completed_orders}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Aktiv</div>
                  </div>
                </div>

                {/* Available Days - Compact badges on mobile */}
                {person.availability_days && person.availability_days.length > 0 && (
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 hidden sm:block">Verfügbare Tage:</div>
                    <div className="flex flex-wrap gap-0.5 sm:gap-1">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                        <Badge
                          key={day}
                          variant={person.availability_days?.includes(day) ? "default" : "outline"}
                          className="text-[10px] sm:text-xs px-1 sm:px-2"
                        >
                          {dayLabels[day as keyof typeof dayLabels]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons - Icon only on mobile */}
                <div className="flex justify-between pt-2 sm:pt-3 border-t space-x-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleEditStaff(person);
                    }}
                    onTouchEnd={(e) => e.stopPropagation()}
                    className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    <span className="text-sm sm:text-base mr-0 sm:mr-1">✏️</span>
                    <span className="hidden sm:inline">Bearbeiten</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteStaff(person.id)}
                    className="text-destructive hover:text-destructive h-8 sm:h-9"
                  >
                    <span className="text-sm sm:text-base">🗑️</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EditLaundryStaffDialog
        staff={editingStaff}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setIsCreatingNew(false);
        }}
        onUpdate={isCreatingNew ? handleCreateStaff : handleUpdateStaff}
        mode={isCreatingNew ? 'create' : 'edit'}
      />
    </div>
  );
};

export default LaundryStaffManagement;