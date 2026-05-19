import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { APP_VERSION } from "@/lib/version";

const titleKeyByPath = (pathname: string) => {
  if (pathname.startsWith("/calendar")) return "tabs.calendar";
  if (pathname.startsWith("/orders")) return "tabs.orders";
  if (pathname.startsWith("/messages")) return "tabs.messages";
  if (pathname.startsWith("/settings")) return "tabs.settings";
  return "tabs.dashboard";
};

const TopBar = () => {
  const { t } = useTranslation("navigation");
  const { pathname } = useLocation();
  const titleKey = titleKeyByPath(pathname);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-border">
      <div className="flex items-center gap-2 h-14 px-3 sm:px-6 max-w-7xl mx-auto">
        <SidebarTrigger className="hidden md:inline-flex h-10 w-10" />
        <div className="flex md:hidden items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-xl">🧺</span>
          </div>
        </div>
        <h1 className="flex-1 text-base sm:text-lg font-semibold truncate text-foreground">
          {t(titleKey)}
        </h1>
        <span className="hidden sm:inline text-xs text-muted-foreground mr-1">v{APP_VERSION}</span>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default TopBar;
