import { PackageCheck } from "lucide-react";
import ViewSettingsDialog, { ViewSettings } from "@/components/ViewSettingsDialog";
import NotificationSettingsDialog from "@/components/NotificationSettingsDialog";

interface HeaderProps {
  viewSettings?: ViewSettings;
  onViewSettingsChange?: (settings: ViewSettings) => void;
}

const Header = ({ viewSettings, onViewSettingsChange }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <PackageCheck className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Teuni Wäscheportal
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {viewSettings && onViewSettingsChange && (
            <ViewSettingsDialog
              settings={viewSettings}
              onSettingsChange={onViewSettingsChange}
            />
          )}
          <NotificationSettingsDialog />
        </div>
      </div>
    </header>
  );
};

export default Header;