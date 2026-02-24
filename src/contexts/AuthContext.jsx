
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const isSetPasswordRoute = () => (
    typeof window !== 'undefined' && window.location.pathname === '/set-password'
  );

  const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

  const hasAdminAccessForEmail = async (email) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return { isAdmin: false, error: null };
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('email');

    if (error) {
      return { isAdmin: false, error };
    }

    const isAdmin = Array.isArray(data)
      && data.some((row) => normalizeEmail(row?.email) === normalizedEmail);

    return { isAdmin, error: null };
  };

  useEffect(() => {
    // Check initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (isSetPasswordRoute()) {
            setUser(session.user);
            setIsAdmin(false);
            setLoading(false);
            return;
          }
          await verifyAdminStatus(session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Initial auth check failed:", error);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (isSetPasswordRoute()) {
          setUser(session.user);
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        await verifyAdminStatus(session.user);
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const verifyAdminStatus = async (currentUser) => {
    try {
      const { isAdmin: allowed, error } = await hasAdminAccessForEmail(currentUser?.email);

      if (error) {
        console.warn("Admin verification failed or user not found in admin_users:", error.message);
        setUser(currentUser);
        setIsAdmin(false);
        setAuthError("Kunne ikke verifisere admin-tilgang. Prøv igjen.");
        return;
      }

      if (allowed) {
        setUser(currentUser);
        setIsAdmin(true);
        setAuthError(null);
      } else {
        console.error("User is not an authorized admin. Signing out.");
        await signOut();
        setUser(null);
        setIsAdmin(false);
        setAuthError("Du har ikke tilgang til admin-panelet.");
      }
    } catch (err) {
      console.error("Unexpected error verifying admin:", err);
      setIsAdmin(false);
    } finally {
      // ALWAYS set loading to false after verification is done
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setAuthError(null);
    try {
      // Explicitly constructing the credentials object for Supabase
      const credentials = {
        email: email,
        password: password
      };

      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      if (data.user) {
        // Explicitly check admin table after login success (normalize email to avoid case/space mismatch)
        const loginEmail = data.user.email || email;
        const { isAdmin: allowed, error: adminError } = await hasAdminAccessForEmail(loginEmail);

        if (adminError) {
          console.error("Post-login admin check failed:", adminError);
          await supabase.auth.signOut();
          throw new Error("Kunne ikke verifisere admin-tilgang. Prøv igjen.");
        }

        if (!allowed) {
          console.error("Post-login admin check failed. User not in admin_users table.");
          await supabase.auth.signOut();
          throw new Error("Bruker har ikke admin-rettigheter.");
        }

        // FIX: Update state immediately to avoid race condition with ProtectedRoute
        setUser(data.user);
        setIsAdmin(true);

        return { data, error: null };
      }

      return { data, error: null };

    } catch (error) {
      console.error("Login exception:", error.message);
      setAuthError(error.message);
      return { data: null, error };
    }
  };

  const signInWithMagicLink = async (email) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: window.location.origin + '/admin/dashboard',
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Magic link error:", error.message);
      setAuthError(error.message);
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Sign out error:", error);
    setUser(null);
    setIsAdmin(false);
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, authError, signIn, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
