
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Listen for auth changes - this fires immediately with initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`);

      if (session?.user) {
        // If we have a user, verify admin status
        // This handles both initial load and subsequent sign-ins (including magic link)
        await verifyAdminStatus(session.user);
      } else {
        // No user session
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
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
    } finally {
      // ALWAYS set loading to false after verification is done
      setLoading(false);
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
