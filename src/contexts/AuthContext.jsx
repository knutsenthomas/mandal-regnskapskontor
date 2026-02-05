
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check active session and verify admin status
    const checkUser = async () => {
      try {
        console.log("Initializing Auth Context...");
        if (!supabase) {
          console.error("Supabase client is not initialized.");
          setAuthError("Systemfeil: Databaseforbindelse mangler.");
          setLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error);
          setAuthError(error.message);
        }

        if (session?.user) {
          console.log("User session found:", session.user.email);
          await verifyAdminStatus(session.user);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Unexpected error during auth initialization:", err);
        setAuthError("Uventet feil ved oppstart.");
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`);
      if (session?.user) {
        // If we just signed in, verify admin status again
        if (event === 'SIGNED_IN') {
          await verifyAdminStatus(session.user);
        } else {
          setUser(session.user);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const verifyAdminStatus = async (currentUser) => {
    try {
      console.log("Verifying admin status for:", currentUser.email);
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', currentUser.email)
        .single();

      if (error) {
        console.warn("Admin verification failed or user not found in admin_users:", error.message);
        // If not found in admin_users, force sign out
        if (error.code === 'PGRST116') { // JSON error for no rows returned
          console.error("User is not an authorized admin. Signing out.");
          await signOut();
          setAuthError("Du har ikke tilgang til admin-panelet.");
          return;
        }
      }

      if (data) {
        console.log("Admin verified:", data);
        setUser(currentUser);
        setIsAdmin(true);
        setAuthError(null);
      } else {
        setUser(currentUser);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Unexpected error verifying admin:", err);
      setIsAdmin(false);
    }
  };

  const signIn = async (email, password) => {
    setAuthError(null);
    try {
      console.log("Attempting sign in for:", email);

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
        // Explicitly check admin table after login success
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .single();

        if (adminError || !adminData) {
          console.error("Post-login admin check failed. User not in admin_users table.");
          await supabase.auth.signOut();
          throw new Error("Bruker har ikke admin-rettigheter.");
        }

        console.log("Sign in successful and admin verified.");
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
      console.log("Sending magic link to:", email);
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
    console.log("Signing out...");
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
