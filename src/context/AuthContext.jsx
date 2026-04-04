import { createContext, useContext, useEffect, useState } from "react";
import { supabase, hasSupabaseEnv } from "../lib/supabase";

const AuthContext = createContext(null);
const DEMO_SESSION_KEY = "binwatch-demo-session";
const DEFAULT_ROLE = "user";

function normalizeRole(role) {
  return role === "driver" ? "driver" : DEFAULT_ROLE;
}

function attachRole(session, fallbackRole = DEFAULT_ROLE) {
  if (!session) return null;
  const metadataRole = session.user?.app_metadata?.role ?? session.user?.user_metadata?.role;
  return {
    ...session,
    role: normalizeRole(session.role ?? metadataRole ?? fallbackRole),
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseEnv) {
      const saved = localStorage.getItem(DEMO_SESSION_KEY);
      if (saved) {
        try {
          const parsedSession = JSON.parse(saved);
          setSession(attachRole(parsedSession));
        } catch (_error) {
          localStorage.removeItem(DEMO_SESSION_KEY);
        }
      }
      setLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(attachRole(data.session));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(attachRole(nextSession));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password, role = DEFAULT_ROLE) {
    if (!hasSupabaseEnv) {
      const normalizedRole = normalizeRole(role);
      const demoSession = {
        user: {
          id: `demo-${normalizedRole}`,
          email,
        },
        role: normalizedRole,
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
        role: session ? normalizeRole(session.role) : null,
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
