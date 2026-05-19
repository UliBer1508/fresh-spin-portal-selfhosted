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
    <div className="md:border-b md:border-border md:bg-white">
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

      </div>

      {/* Mobile Layout - Fixed Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-around w-full px-1 pt-1.5 pb-1">
          {tabs.map((tab) => {
            const label = t(tab.labelKey);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 min-w-0 py-1 gap-0.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "text-2xl relative leading-none",
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
                <span className={cn("text-[11px] font-medium truncate max-w-full", isActive && "font-semibold")}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default TabNavigation;
