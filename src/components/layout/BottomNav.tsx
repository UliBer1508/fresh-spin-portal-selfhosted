import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { usePortalMessages } from "@/hooks/usePortalMessages";

const items = [
  { to: "/", labelKey: "tabs.dashboard", emoji: "🏠", end: true },
  { to: "/calendar", labelKey: "tabs.calendar", emoji: "📅" },
  { to: "/orders", labelKey: "tabs.orders", emoji: "🧺" },
  { to: "/messages", labelKey: "tabs.messages", emoji: "💬", showBadge: true },
  { to: "/settings", labelKey: "tabs.settings", emoji: "⚙️" },
];

const BottomNav = () => {
  const { t } = useTranslation("navigation");
  const { unreadCount } = usePortalMessages();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border pb-[env(safe-area-inset-bottom)]"
      aria-label="Hauptnavigation"
    >
      <ul className="flex justify-around items-stretch">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center gap-0.5 h-16 min-h-[44px] text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-2xl leading-none" role="img" aria-label={t(item.labelKey)}>
                    {item.emoji}
                  </span>
                  <span className="truncate max-w-[60px]">{t(item.labelKey)}</span>
                  {item.showBadge && unreadCount > 0 && (
                    <span className="absolute top-1 right-1/2 translate-x-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
