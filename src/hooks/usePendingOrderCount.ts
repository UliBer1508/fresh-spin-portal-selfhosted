import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Liefert die Anzahl der Wäschebestellungen mit Status "offen" oder "ausstehend".
 * Aktualisiert sich automatisch über Supabase Realtime.
 */
export const usePendingOrderCount = () => {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    const { count: c, error } = await supabase
      .from('linen_orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['offen', 'ausstehend']);
    if (!error && typeof c === 'number') setCount(c);
  };

  useEffect(() => {
    fetchCount();
    const channel = supabase
      .channel('pending-order-count')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'linen_orders' },
        () => fetchCount()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
};
