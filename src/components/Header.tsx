// v7.1 - Mobile settings support
import ViewSettingsDialog, { ViewSettings } from "@/components/ViewSettingsDialog";
import { APP_VERSION } from "@/lib/version";

interface HeaderProps {
  viewSettings?: ViewSettings;
  onViewSettingsChange?: (settings: ViewSettings) => void;
}

const Header = ({ viewSettings, onViewSettingsChange }: HeaderProps) => {
  const shouldShowButton = viewSettings && onViewSettingsChange;
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
              settings={viewSettings!}
              onSettingsChange={onViewSettingsChange!}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;