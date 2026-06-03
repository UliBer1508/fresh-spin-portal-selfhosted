// v12.8 - Auth: Logout + Change Password
import { useState } from "react";
import { KeyRound } from "lucide-react";
import ViewSettingsDialog, { ViewSettings } from "@/components/ViewSettingsDialog";
import { ChatButton } from "@/components/PortalChat";
import { Button } from "@/components/ui/button";
import { usePortalMessages } from "@/hooks/usePortalMessages";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";

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
  const [pwOpen, setPwOpen] = useState(false);

  const shouldShowButton =
    viewSettings &&
    onSettingsChange &&
    isMobileDevice !== undefined &&
    (!isMobileDevice || showButtonOnMobile);

  return (
    <header className="bg-white border-b border-border px-4 md:px-6 py-2">
      <div className="flex items-center justify-end max-w-7xl mx-auto gap-3">
        <span className="hidden md:inline-flex">
          <ChatButton onClick={() => onChatOpen?.()} unreadCount={unreadCount} />
        </span>

        {shouldShowButton && (
          <span className="hidden md:inline-flex">
            <ViewSettingsDialog
              settings={viewSettings!}
              onSettingsChange={onSettingsChange!}
              isMobileDevice={isMobileDevice!}
              showButtonOnMobile={showButtonOnMobile}
              onShowButtonOnMobileChange={onShowButtonOnMobileChange}
            />
          </span>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setPwOpen(true)}
          title="Passwort ändern"
        >
          <KeyRound className="h-4 w-4" />
        </Button>

        <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
      </div>
    </header>
  );
};

export default Header;
