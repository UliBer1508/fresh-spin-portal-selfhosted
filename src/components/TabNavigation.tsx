import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Calendar, Users } from "lucide-react";
import NotificationSettingsDialog from "@/components/NotificationSettingsDialog";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="border-b border-border bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-12">
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
            </TabsList>
          </Tabs>
          <div className="flex items-center">
            <NotificationSettingsDialog />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;