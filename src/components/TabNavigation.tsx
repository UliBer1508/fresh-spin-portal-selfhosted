// v10 - Lucide icons in mobile nav
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";
import { usePortalMessages } from "@/hooks/usePortalMessages";
import { Home, Calendar, Receipt, Bell, MessageCircle, type LucideIcon } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasNewOrders?: boolean;
  onChatOpen?: () => void;
  onNotificationSettingsOpen?: () => void;
}

interface TabDef {
  id: string;
  labelKey: string;
  icon: LucideIcon;
}

const TabNavigation = ({ activeTab, onTabChange, hasNewOrders, onChatOpen, onNotificationSettingsOpen }: TabNavigationProps) => {
  const { t } = useTranslation('navigation');
  const { unreadCount } = usePortalMessages();

  const tabs: TabDef[] = [
    { id: "waesche", labelKey: "tabs.bookings", icon: Home },
    { id: "kalender", labelKey: "tabs.calendar", icon: Calendar },
    { id: "rechnungen", labelKey: "tabs.invoices", icon: Receipt },
    { id: "benachrichtigungen", labelKey: "tabs.notifications", icon: Bell },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === "benachrichtigungen" && onNotificationSettingsOpen) {
      onNotificationSettingsOpen();
      return;
    }
    onTabChange(tabId);
  };

  return (
    <div className="md:border-b md:border-border md:bg-accent">
      <div className="max-w-7xl mx-auto px-6">
        {/* Desktop Layout - Single Row */}
        <div className="hidden md:flex items-center justify-between h-12">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const label = t(tab.labelKey);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "flex items-center gap-2 h-12 px-4 font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  <span className="relative inline-flex">
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        tab.id === "benachrichtigungen" && hasNewOrders && "animate-bell-ring"
                      )}
                      strokeWidth={2}
                      aria-label={label}
                    />
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-accent backdrop-blur border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.04)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="text-center text-[11px] text-muted-foreground py-1 border-b border-border/50">
          © {new Date().getFullYear()} Copy Right Steinbock Chalets
        </div>
        <div className="flex justify-around w-full px-1 pt-1.5 pb-1">
          {tabs.map((tab) => {
            const label = t(tab.labelKey);
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 min-w-0 py-1 gap-0.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative inline-flex leading-none">
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      tab.id === "benachrichtigungen" && hasNewOrders && "animate-bell-ring"
                    )}
                    strokeWidth={2}
                    aria-label={label}
                  />
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

          {/* Chat Button */}
          {onChatOpen && (
            <button
              onClick={onChatOpen}
              className="flex flex-col items-center justify-center flex-1 min-w-0 py-1 gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Chat"
            >
              <span className="relative inline-flex leading-none">
                <MessageCircle className="w-6 h-6" strokeWidth={2} aria-label="Chat" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-medium truncate max-w-full">Chat</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default TabNavigation;
