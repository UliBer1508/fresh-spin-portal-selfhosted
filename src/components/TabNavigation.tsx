import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const tabs = [
    { id: "waesche", label: "Wäsche (4)", emoji: "🧺" },
    { id: "kalender", label: "Kalender", emoji: "📅" },
    { id: "waeschekraefte", label: "Wäschekräfte", emoji: "👥" },
    { id: "benachrichtigungen", label: "Benachrichtigungen", emoji: "🔔" },
  ];

  return (
    <div className="border-b border-border bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Desktop Layout - Single Row */}
        <div className="hidden md:flex items-center justify-between h-12">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center h-12 px-4 font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  <span className="text-lg mr-2">{tab.emoji}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Layout - 4 Tabs im 2x2 Grid */}
        <div className="md:hidden py-2">
          <div className="grid w-full grid-cols-2 gap-2">
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center justify-center rounded-lg h-10 px-3 font-medium text-xs transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <span className="text-sm mr-1">{tab.emoji}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;