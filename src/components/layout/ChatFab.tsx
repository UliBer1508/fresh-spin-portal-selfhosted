import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PortalChat from "@/components/PortalChat";
import { usePortalMessages } from "@/hooks/usePortalMessages";

const ChatFab = () => {
  const [open, setOpen] = useState(false);
  const { unreadCount } = usePortalMessages();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Chat öffnen"
        className="fixed right-4 z-30 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center"
      >
        <MessageCircle className="w-7 h-7" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </button>
      <PortalChat isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default ChatFab;
