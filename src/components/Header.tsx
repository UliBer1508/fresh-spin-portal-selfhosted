// v12.6 - Multi-language support
import { useTranslation } from 'react-i18next';
import ViewSettingsDialog, { ViewSettings } from "@/components/ViewSettingsDialog";
import { APP_VERSION } from "@/lib/version";
import { ChatButton } from "@/components/PortalChat";
import { usePortalMessages } from "@/hooks/usePortalMessages";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
  const { t } = useTranslation();
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
              {t('header.title')}
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">v{APP_VERSION}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Chat Button (Desktop only - mobile has it in bottom tab nav) */}
          <div className="hidden md:block">
            <ChatButton onClick={() => onChatOpen?.()} unreadCount={unreadCount} />
          </div>
          
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
