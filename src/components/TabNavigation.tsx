// v6 - Fix React imports consistency
import { cn } from "@/lib/utils";
// Cache bust v2 - emojis fixed

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasNewOrders?: boolean;
}

const TabNavigation = ({ activeTab, onTabChange, hasNewOrders }: TabNavigationProps) => {
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
                    "flex items-center gap-2 h-12 px-4 font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  <span 
                    className={cn(
                      "text-xl relative",
                      tab.id === "benachrichtigungen" && hasNewOrders && "animate-bell-ring"
                    )} 
                    role="img" 
                    aria-label={tab.label}
                  >
                    {tab.emoji}
                    {tab.id === "benachrichtigungen" && hasNewOrders && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Layout - Icon-Only Horizontal */}
        <div className="md:hidden py-2">
          <div className="flex justify-around w-full">
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-center w-14 h-14 rounded-full transition-colors relative",
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span 
                    className={cn(
                      "text-2xl relative",
                      tab.id === "benachrichtigungen" && hasNewOrders && "animate-bell-ring"
                    )} 
                    role="img" 
                    aria-label={tab.label}
                  >
                    {tab.emoji}
                    {tab.id === "benachrichtigungen" && hasNewOrders && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </span>
                  {activeTab === tab.id && (
                    <span className="absolute bottom-2 w-6 h-0.5 bg-primary rounded-full" />
                  )}
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