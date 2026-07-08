import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { PROVIDER_IDS } from '@/lib/constants';

// Provider-ID aus zentralen Konstanten
const TEUNI_PROVIDER_ID = PROVIDER_IDS.TEUNI;

export interface PortalMessage {
  id: string;
  provider_id: string;
  sender_type: 'admin' | 'provider' | 'assistant';
  message: string;
  is_read: boolean;
  related_task_id?: string | null;
  related_linen_order_id?: string | null;
  created_at: string;
}

export const usePortalMessages = () => {
  const queryClient = useQueryClient();

  // Nachrichten laden
  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ['portal-messages', TEUNI_PROVIDER_ID],
    queryFn: async () => {
      console.log('📩 Fetching portal messages...');
      const { data, error } = await supabase
        .from('provider_messages')
        .select('*')
        .eq('provider_id', TEUNI_PROVIDER_ID)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching messages:', error);
        throw error;
      }
      console.log('✅ Messages loaded:', data?.length, 'messages');
      return data as PortalMessage[];
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Ungelesene Admin-Nachrichten zählen
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['portal-unread-count', TEUNI_PROVIDER_ID],
    queryFn: async () => {
      console.log('🔔 Fetching unread count...');
      const { count, error } = await supabase
        .from('provider_messages')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', TEUNI_PROVIDER_ID)
        .neq('sender_type', 'provider')  // Admin UND Max (assistant) zählen, nicht eigene
        .eq('is_read', false);

      if (error) throw error;
      console.log('🔔 Unread count:', count);
      return count || 0;
    },
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Nachricht senden (als Provider)
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const { data, error } = await supabase
        .from('provider_messages')
        .insert({
          provider_id: TEUNI_PROVIDER_ID,
          sender_type: 'provider',  // WICHTIG: Als Provider senden
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-messages', TEUNI_PROVIDER_ID] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Die Nachricht konnte nicht gesendet werden.');
    },
  });

  // Admin-Nachrichten als gelesen markieren
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('provider_messages')
        .update({ is_read: true })
        .eq('provider_id', TEUNI_PROVIDER_ID)
        .eq('sender_type', 'admin')
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-messages', TEUNI_PROVIDER_ID] });
      queryClient.invalidateQueries({ queryKey: ['portal-unread-count', TEUNI_PROVIDER_ID] });
    },
  });

  // Realtime Subscription für Live-Updates
  useEffect(() => {
    console.log('🔌 Setting up realtime subscription...');
    
    const channel = supabase
      .channel(`teuni-portal-messages-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'provider_messages',
          filter: `provider_id=eq.${TEUNI_PROVIDER_ID}`,
        },
        (payload) => {
          console.log('📬 Realtime update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['portal-messages', TEUNI_PROVIDER_ID] });
          queryClient.invalidateQueries({ queryKey: ['portal-unread-count', TEUNI_PROVIDER_ID] });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    return () => {
      console.log('🔌 Removing realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    messages,
    isLoading,
    error,
    unreadCount,
    sendMessage: sendMessageMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
  };
};
