import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: { unsubscribe: () => void } | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  cleanup: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  subscription: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  initialize: async () => {
    const supabase = createClient();

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth error:", error);
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      });

      // Set up auth state listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        set({
          user: session?.user || null,
          isAuthenticated: !!session?.user,
          isLoading: false,
        });
      });

      // Store subscription for cleanup
      set({ subscription });
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  },

  cleanup: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },
}));
