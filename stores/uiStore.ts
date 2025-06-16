import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  isLoggingOut: boolean;
  logoutSuccess: boolean;
  showConfirmModal: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoggingOut: (loading: boolean) => void;
  setLogoutSuccess: (success: boolean) => void;
  setShowConfirmModal: (show: boolean) => void;
  resetLogoutState: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  isLoggingOut: false,
  logoutSuccess: false,
  showConfirmModal: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  setLoggingOut: (loading) => set({ isLoggingOut: loading }),

  setLogoutSuccess: (success) => set({ logoutSuccess: success }),

  setShowConfirmModal: (show) => set({ showConfirmModal: show }),

  resetLogoutState: () =>
    set({
      isLoggingOut: false,
      logoutSuccess: false,
      showConfirmModal: false,
    }),
}));
