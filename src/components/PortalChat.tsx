import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { usePortalMessages } from '@/hooks/usePortalMessages';

interface PortalChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const PortalChat = ({ isOpen, onClose }: PortalChatProps) => {
  const [input, setInput] = useState('');
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, isLoading, error, markAsRead, sendMessage } = usePortalMessages();

  // Auto-scroll zu neuen Nachrichten
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // VisualViewport API für Tastatur-Handhabung
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      }
    };

    // Initial setzen
    handleResize();

    // Auf Tastatur-Events reagieren
    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  // Admin-Nachrichten als gelesen markieren wenn Chat geöffnet
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      const unreadAdminMessages = messages
        .filter((msg) => msg.sender_type === 'admin' && !msg.is_read)
        .map((msg) => msg.id);
      
      if (unreadAdminMessages.length > 0) {
        markAsRead(unreadAdminMessages);
      }
    }
  }, [isOpen, messages, markAsRead]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFocus = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-background border-0 shadow-2xl flex flex-col w-full max-w-full overflow-hidden h-[100dvh] sm:inset-auto sm:bottom-6 sm:right-6 sm:left-auto sm:w-[380px] sm:h-[500px] sm:rounded-lg sm:border"
      style={{ 
        height: viewportHeight && window.innerWidth < 640 
          ? `${viewportHeight}px` 
          : undefined 
      }}
    >
      {/* Header */}
      <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] sm:pt-4 border-b bg-card sm:rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Nachrichten vom Admin</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error && (
          <div className="flex items-center justify-center h-full text-center text-destructive">
            <p className="text-sm">Fehler beim Laden: {error.message}</p>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Noch keine Nachrichten</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'provider' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.sender_type === 'provider'
                    ? 'bg-primary text-primary-foreground'  // Eigene Nachrichten rechts (blau)
                    : 'bg-muted'  // Admin-Nachrichten links (grau)
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.created_at).toLocaleString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-4 border-t bg-card sm:rounded-b-lg flex gap-2 flex-shrink-0">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Nachricht schreiben..."
          className="min-h-[44px] max-h-[100px] resize-none flex-1 min-w-0"
          rows={1}
        />
        <Button onClick={handleSend} disabled={!input.trim()} size="icon" className="h-[44px] w-[44px] flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PortalChat;
