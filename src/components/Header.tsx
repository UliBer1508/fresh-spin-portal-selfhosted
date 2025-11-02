// v9.0 - Separate Desktop/Mobile ViewSettings
import ViewSettingsDialog, { ViewSettings } from "@/components/ViewSettingsDialog";
import { APP_VERSION } from "@/lib/version";

interface HeaderProps {
  desktopViewSettings?: ViewSettings;
  mobileViewSettings?: ViewSettings;
  onDesktopSettingsChange?: (settings: ViewSettings) => void;
  onMobileSettingsChange?: (settings: ViewSettings) => void;
  isMobileDevice?: boolean;
}

const Header = ({ 
  desktopViewSettings, 
  mobileViewSettings, 
  onDesktopSettingsChange, 
  onMobileSettingsChange,
  isMobileDevice 
}: HeaderProps) => {
  const shouldShowButton = desktopViewSettings && mobileViewSettings && 
                           onDesktopSettingsChange && onMobileSettingsChange &&
                           isMobileDevice !== undefined;
  return (
    <header className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-2xl">🧺</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Teuni Wäscheportal
            </h1>
            <p className="text-xs text-muted-foreground">v{APP_VERSION}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {shouldShowButton && (
            <ViewSettingsDialog
              desktopSettings={desktopViewSettings!}
              mobileSettings={mobileViewSettings!}
              onDesktopSettingsChange={onDesktopSettingsChange!}
              onMobileSettingsChange={onMobileSettingsChange!}
              isMobileDevice={isMobileDevice!}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;