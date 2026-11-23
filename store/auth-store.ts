import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  initialize: () => void;
  signOut: () => Promise<void>;
};

let initialized = false;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    if (initialized) return;

    initialized = true;

    const supabase = createClient();

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      });
    });
  },

  signOut: async () => {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },
}));
