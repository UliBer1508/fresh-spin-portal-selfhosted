import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Calendar, Package, MessageSquare, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePortalMessages } from "@/hooks/usePortalMessages";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", labelKey: "tabs.dashboard", icon: Home, end: true },
  { to: "/calendar", labelKey: "tabs.calendar", icon: Calendar },
  { to: "/orders", labelKey: "tabs.orders", icon: Package },
  { to: "/messages", labelKey: "tabs.messages", icon: MessageSquare, badge: true },
  { to: "/settings", labelKey: "tabs.settings", icon: Settings },
];

const AppSidebar = () => {
  const { t } = useTranslation("navigation");
  const { state } = useSidebar();
  const { pathname } = useLocation();
  const { unreadCount } = usePortalMessages();
  const collapsed = state === "collapsed";

  const isActive = (to: string, end?: boolean) =>
    end ? pathname === to : pathname.startsWith(to);

  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarContent>
        <div className="flex items-center gap-2 px-3 py-4">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🧺</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-foreground truncate">Teuni</span>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.to, item.end);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.to} end={item.end} className="flex items-center gap-2 relative">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && <span>{t(item.labelKey)}</span>}
                        {item.badge && unreadCount > 0 && (
                          <span
                            className={cn(
                              "ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center",
                              collapsed && "absolute top-0 right-0 ml-0"
                            )}
                          >
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
