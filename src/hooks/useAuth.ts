import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const mountedRef = useRef(true);

  const checkAdmin = useCallback((email?: string) => {
    const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || "").replace(/^['"]|['"]$/g, "").toLowerCase().trim();
    if (!email || !adminEmail) return false;
    
    const userEmail = email.toLowerCase().trim();
    console.log("Auth Check:", { userEmail, adminEmail, match: userEmail === adminEmail });
    return userEmail === adminEmail;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      
      setSession(session);
      if (session?.user?.email) {
        setIsAdmin(checkAdmin(session.user.email));
      }
      setLoading(false);
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mountedRef.current) return;
        setSession(session);
        if (session?.user?.email) {
          setIsAdmin(checkAdmin(session.user.email));
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [checkAdmin]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
      setIsAdmin(false);
    }
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  return { 
    session, 
    user: session?.user ?? null,
    loading, 
    isAdmin, 
    signIn, 
    signUp, 
    signOut,
    resetPassword,
    updatePassword
  };
};
