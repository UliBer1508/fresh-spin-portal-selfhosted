import { useState } from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const SearchAndFilter = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [houseFilter, setHouseFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setHouseFilter("all");
    setTimeFilter("all");
  };

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
            <SelectContent>
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
            <SelectContent>
              <SelectItem value="all">Alle Häuser</SelectItem>
              <SelectItem value="wald-chalet">Wald Chalet</SelectItem>
              <SelectItem value="berg-villa">Berg Villa</SelectItem>
              <SelectItem value="see-haus">See Haus</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Alle Zeiten" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Zeiten</SelectItem>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-primary bg-accent font-medium">
            4 von 4 Wäsche-Aufträgen
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Filter zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;