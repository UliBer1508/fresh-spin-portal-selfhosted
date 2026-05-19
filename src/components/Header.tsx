// v12.7 - Header reduced to actions only (logo/title removed)
import ViewSettingsDialog, { ViewSettings } from "@/components/ViewSettingsDialog";
import { ChatButton } from "@/components/PortalChat";
import { usePortalMessages } from "@/hooks/usePortalMessages";

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
  onChatOpen,
}: HeaderProps) => {
  const { unreadCount } = usePortalMessages();

  const shouldShowButton =
    viewSettings &&
    onSettingsChange &&
    isMobileDevice !== undefined &&
    (!isMobileDevice || showButtonOnMobile);

  // Nothing to show on mobile → hide the bar entirely
  const hasDesktopActions = true; // chat + optional settings always render on desktop

  return (
    <header className="hidden md:block bg-white border-b border-border px-6 py-2">
      <div className="flex items-center justify-end max-w-7xl mx-auto gap-3">
        <ChatButton onClick={() => onChatOpen?.()} unreadCount={unreadCount} />

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
    </header>
  );
};

export default Header;
