// v12.0 - Unified ViewSettings with Mobile Button Toggle
import { useState } from "react";
import ViewSettingsDialog, { ViewSettings } from "@/components/ViewSettingsDialog";
import { APP_VERSION } from "@/lib/version";
import { Badge } from "@/components/ui/badge";
import { usePortalMessages } from "@/hooks/usePortalMessages";
import chatIcon from "@/assets/chat-icon.png";

interface HeaderProps {
  viewSettings?: ViewSettings;
  onSettingsChange?: (settings: ViewSettings) => void;
  isMobileDevice?: boolean;
  showButtonOnMobile?: boolean;
  onShowButtonOnMobileChange?: (value: boolean) => void;
  onChatOpen?: () => void;
}

const Header = ({ 
  viewSettings, 
  onSettingsChange,
  isMobileDevice,
  showButtonOnMobile = false,
  onShowButtonOnMobileChange,
  onChatOpen
}: HeaderProps) => {
  const { unreadCount } = usePortalMessages();
  
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
          {/* Chat Icon mit Badge */}
          <button 
            onClick={onChatOpen}
            className="relative transition-transform hover:scale-110"
            aria-label="Chat öffnen"
          >
            <img src={chatIcon} alt="Chat" className="w-20 h-20 md:w-24 md:h-24 drop-shadow-lg" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground animate-pulse text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </button>
          
          {shouldShowButton && (
            <ViewSettingsDialog
              settings={viewSettings!}
              onSettingsChange={onSettingsChange!}
              isMobileDevice={isMobileDevice!}
              showButtonOnMobile={showButtonOnMobile}
              onShowButtonOnMobileChange={onShowButtonOnMobileChange}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;