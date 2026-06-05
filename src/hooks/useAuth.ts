import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const PORTAL_EMAIL = import.meta.env.VITE_PORTAL_EMAIL as string;
const PORTAL_PASSWORD = import.meta.env.VITE_PORTAL_PASSWORD as string;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setLoading(false);
        return;
      }

      if (!PORTAL_EMAIL || !PORTAL_PASSWORD) {
        console.error("[Portal] Missing VITE_PORTAL_EMAIL / VITE_PORTAL_PASSWORD env vars");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: PORTAL_EMAIL,
        password: PORTAL_PASSWORD,
      });
      if (error) {
        console.error("[Portal] Auto-login failed:", error.message);
      } else {
        setSession(data.session);
        setUser(data.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}
