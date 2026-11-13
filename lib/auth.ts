/**
 * Auth helpers for Ada (Supabase Auth)
 * 
 * Once NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are set in .env.local, these functions become fully functional.
 */

import { supabase } from "./supabase";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

/** Sign up with email + password */
export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: name || email.split("@")[0] }
    }
  });

  if (error) throw error;
  return data;
}

/** Sign in with email + password */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

/** Sign out */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get current session (client-side) */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Get current user (client-side) */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email || "",
    name: data.user.user_metadata?.name
  };
}

/** Listen to auth state changes */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.user_metadata?.name
      });
    } else {
      callback(null);
    }
  });

  return data.subscription;
}
