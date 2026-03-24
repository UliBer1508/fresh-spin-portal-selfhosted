// v8 - Multi-language support
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasNewOrders?: boolean;
}

const TabNavigation = ({ activeTab, onTabChange, hasNewOrders }: TabNavigationProps) => {
  const { t } = useTranslation('navigation');

  const tabs = [
    { id: "waesche", labelKey: "tabs.bookings", emoji: "🧺" },
    { id: "kalender", labelKey: "tabs.calendar", emoji: "📅" },
    { id: "rechnungen", labelKey: "tabs.invoices", emoji: "🧾" },
    { id: "waeschekraefte", labelKey: "tabs.staff", emoji: "👥" },
    { id: "benachrichtigungen", labelKey: "tabs.notifications", emoji: "🔔" },
  ];

  return (
    <div className="border-b border-border bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Desktop Layout - Single Row */}
        <div className="hidden md:flex items-center justify-between h-12">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const label = t(tab.labelKey);
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
                    aria-label={label}
                  >
                    {tab.emoji}
                    {tab.id === "benachrichtigungen" && hasNewOrders && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Layout - Icon-Only Horizontal */}
        <div className="md:hidden py-2">
          <div className="flex justify-around w-full">
            {tabs.map((tab) => {
              const label = t(tab.labelKey);
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
                    aria-label={label}
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
