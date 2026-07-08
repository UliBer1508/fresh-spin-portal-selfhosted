import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePortalMessages } from '@/hooks/usePortalMessages';

interface ChatButtonProps {
  onClick: () => void;
  unreadCount: number;
}

export const ChatButton = ({ onClick, unreadCount }: ChatButtonProps) => (
  <button
    onClick={onClick}
    className="relative w-16 h-16 md:w-18 md:h-18 flex-shrink-0 bg-primary rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
    aria-label="Chat öffnen"
  >
    <MessageCircle className="w-8 h-8 md:w-9 md:h-9 text-primary-foreground" />
    {unreadCount > 0 && (
      <Badge 
        variant="destructive" 
        className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-sm font-bold animate-pulse"
      >
        {unreadCount}
      </Badge>
    )}
  </button>
);

interface PortalChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const PortalChat = ({ isOpen, onClose }: PortalChatProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, isLoading, error, markAsRead, sendMessage } = usePortalMessages();

  // Auto-scroll zu neuen Nachrichten
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // Admin-Nachrichten als gelesen markieren wenn Chat geöffnet
  useEffect(() => {
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen, markAsRead]);

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
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 md:top-20 md:right-6 md:inset-auto md:w-96 h-[100dvh] md:h-[500px] bg-background border-0 md:border md:rounded-lg shadow-xl z-[100] flex flex-col"
    >
      {/* Header */}
      <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] md:pt-4 border-b bg-primary text-primary-foreground md:rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <h2 className="font-semibold">Nachrichten vom Admin</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-primary-foreground/20">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
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
                    : msg.sender_type === 'assistant'
                    ? 'bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700'  // Max (Assistent)
                    : 'bg-muted'  // Admin-Nachrichten links (grau)
                }`}
              >
                {msg.sender_type === 'assistant' && (
                  <p className="text-xs font-semibold mb-1 text-purple-700 dark:text-purple-300">
                    Max (Assistent)
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {msg.sender_type === 'assistant'
                    ? `Gesendet: ${new Date(msg.created_at).toLocaleString('de-DE', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}`
                    : new Date(msg.created_at).toLocaleString('de-DE', {
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
      </ScrollArea>

      {/* Input */}
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="Nachricht schreiben..."
            className="min-h-[44px] max-h-[100px] resize-none text-base"
            rows={1}
            enterKeyHint="send"
          />
          <Button onClick={handleSend} disabled={!input.trim()} size="icon" className="shrink-0 h-[44px] w-[44px]">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PortalChat;
