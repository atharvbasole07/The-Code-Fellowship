import { createContext, useContext, useEffect, useState } from "react";
import { supabase, hasSupabaseEnv } from "../lib/supabase";

const AuthContext = createContext(null);
const DEMO_SESSION_KEY = "binwatch-demo-session";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      const saved = localStorage.getItem(DEMO_SESSION_KEY);
      if (saved) setSession(JSON.parse(saved));
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    if (!hasSupabaseEnv) {
      const demoSession = {
        user: {
          id: "demo-user",
          email,
        },
      };
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoSession));
      setSession(demoSession);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signOut() {
    if (!hasSupabaseEnv) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signOut,
        isDemoAuth: !hasSupabaseEnv,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
