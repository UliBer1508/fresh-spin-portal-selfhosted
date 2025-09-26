import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Calendar, Users, Bell } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="border-b border-border bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Desktop Layout - Single Row */}
        <div className="hidden md:flex items-center justify-between h-12">
          <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1">
            <TabsList className="h-12 bg-transparent p-0 space-x-8">
              <TabsTrigger 
                value="waesche" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium"
              >
                <Package className="w-4 h-4 mr-2" />
                Wäsche (4)
              </TabsTrigger>
              <TabsTrigger 
                value="kalender"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium text-muted-foreground"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Kalender
              </TabsTrigger>
              <TabsTrigger 
                value="waeschekraefte"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium text-muted-foreground"
              >
                <Users className="w-4 h-4 mr-2" />
                Wäschekräfte
              </TabsTrigger>
              <TabsTrigger 
                value="benachrichtigungen"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12 px-4 font-medium text-muted-foreground"
              >
                <Bell className="w-4 h-4 mr-2" />
                Benachrichtigungen
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile Layout - Two Rows */}
        <div className="md:hidden py-2">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <div className="space-y-2">
              {/* First Row - Wäsche & Kalender */}
              <div className="flex space-x-1">
                <TabsTrigger 
                  value="waesche" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-lg h-10 px-3 font-medium flex-1 text-xs"
                >
                  <Package className="w-4 h-4 mr-1" />
                  Wäsche (4)
                </TabsTrigger>
                <TabsTrigger 
                  value="kalender"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-lg h-10 px-3 font-medium text-muted-foreground flex-1 text-xs"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Kalender
                </TabsTrigger>
              </div>
              
              {/* Second Row - Wäschekräfte & Benachrichtigungen */}
              <div className="flex space-x-1">
                <TabsTrigger 
                  value="waeschekraefte"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-lg h-10 px-3 font-medium text-muted-foreground flex-1 text-xs"
                >
                  <Users className="w-4 h-4 mr-1" />
                  Wäschekräfte
                </TabsTrigger>
                <TabsTrigger 
                  value="benachrichtigungen"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none rounded-lg h-10 px-3 font-medium text-muted-foreground flex-1 text-xs"
                >
                  <Bell className="w-4 h-4 mr-1" />
                  Benachrichtigungen
                </TabsTrigger>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;