import { createContext, useContext, useEffect, useState } from "react";
import { supabase, hasSupabaseEnv } from "../lib/supabase";

const AuthContext = createContext(null);
const DEMO_SESSION_KEY = "binwatch-demo-session";
const DEFAULT_ROLE = "user";

function normalizeRole(role) {
  return role === "driver" ? "driver" : DEFAULT_ROLE;
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

async function getDriverByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!hasSupabaseEnv || !normalizedEmail) return { driver: null, error: null };

  const { data, error } = await supabase
    .from("drivers")
    .select("id, email, is_active")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (error) return { driver: null, error };
  return { driver: data ?? null, error: null };
}

async function resolveRoleFromSession(nextSession) {
  if (!nextSession) return null;

  const metadataRole = normalizeRole(
    nextSession.role ?? nextSession.user?.app_metadata?.role ?? nextSession.user?.user_metadata?.role
  );

  const { driver, error } = await getDriverByEmail(nextSession.user?.email);
  if (error) {
    console.warn("Driver lookup failed. Falling back to session metadata role.", error.message);
    return metadataRole;
  }

  return driver?.is_active ? "driver" : metadataRole;
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
    let active = true;

    async function hydrateSession(nextSession) {
      const resolvedRole = await resolveRoleFromSession(nextSession);
      if (!active) return;
      setSession(attachRole(nextSession, resolvedRole ?? DEFAULT_ROLE));
      setLoading(false);
    }

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
      hydrateSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      hydrateSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password, role = DEFAULT_ROLE) {
    const normalizedRole = normalizeRole(role);
    const normalizedEmail = normalizeEmail(email);

    if (!hasSupabaseEnv) {
      const demoSession = {
        user: {
          id: `demo-${normalizedRole}`,
          email: normalizedEmail,
        },
        role: normalizedRole,
      };
      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoSession));
      setSession(demoSession);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) return { error };

    const { driver, error: driverLookupError } = await getDriverByEmail(normalizedEmail);
    if (driverLookupError) {
      await supabase.auth.signOut();
      return {
        error: {
          message: "Unable to verify driver profile from Supabase. Please apply the latest schema changes.",
        },
      };
    }

    const isDriverEmail = Boolean(driver?.is_active);
    if (normalizedRole === "driver" && !isDriverEmail) {
      await supabase.auth.signOut();
      return {
        error: {
          message: "Driver profile was not found for this email. Use a registered driver email or contact admin.",
        },
      };
    }

    if (normalizedRole === "user" && isDriverEmail) {
      await supabase.auth.signOut();
      return {
        error: {
          message: "This account is registered as a driver. Please use Driver Login.",
        },
      };
    }

    const resolvedRole = isDriverEmail ? "driver" : DEFAULT_ROLE;
    const {
      data: { session: nextSession },
    } = await supabase.auth.getSession();
    setSession(attachRole(nextSession, resolvedRole));

    return { error: null };
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
