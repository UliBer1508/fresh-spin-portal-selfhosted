// v12.0 - Unified ViewSettings with Mobile Button Toggle
import { useState, useEffect } from "react";
import ViewSettingsDialog, { ViewSettings } from "@/components/ViewSettingsDialog";
import { APP_VERSION } from "@/lib/version";

interface HeaderProps {
  viewSettings?: ViewSettings;
  onSettingsChange?: (settings: ViewSettings) => void;
  isMobileDevice?: boolean;
}

const Header = ({ 
  viewSettings, 
  onSettingsChange,
  isMobileDevice 
}: HeaderProps) => {
  const [showButtonOnMobile, setShowButtonOnMobile] = useState(() => {
    const saved = localStorage.getItem('showViewSettingsButtonOnMobile');
    return saved === 'true';
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'showViewSettingsButtonOnMobile') {
        setShowButtonOnMobile(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const shouldShowButton = 
    viewSettings && 
    onSettingsChange && 
    isMobileDevice !== undefined &&
    (!isMobileDevice || showButtonOnMobile);
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
            <p className="text-xs text-muted-foreground hidden sm:block">v{APP_VERSION}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {shouldShowButton && (
            <ViewSettingsDialog
              settings={viewSettings!}
              onSettingsChange={onSettingsChange!}
              isMobileDevice={isMobileDevice!}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;