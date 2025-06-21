import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  isLoggingOut: boolean;
  logoutSuccess: boolean;
  showLogoutConfirmModal: boolean;
  showDeleteConversationModal: boolean;
  conversationToDelete: { id: string; title: string } | null;
  isDeleting: boolean;
  headerMenuOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoggingOut: (loading: boolean) => void;
  setLogoutSuccess: (success: boolean) => void;
  setShowLogoutConfirmModal: (show: boolean) => void;
  setShowDeleteConversationModal: (show: boolean) => void;
  setConversationToDelete: (
    conversation: { id: string; title: string } | null,
  ) => void;
  setIsDeleting: (deleting: boolean) => void;
  setHeaderMenuOpen: (open: boolean) => void;
  toggleHeaderMenu: () => void;
  resetLogoutState: () => void;
  resetDeleteConversationState: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  isLoggingOut: false,
  logoutSuccess: false,
  showLogoutConfirmModal: false,
  showDeleteConversationModal: false,
  conversationToDelete: null,
  isDeleting: false,
  headerMenuOpen: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  setLoggingOut: (loading) => set({ isLoggingOut: loading }),

  setLogoutSuccess: (success) => set({ logoutSuccess: success }),

  setShowLogoutConfirmModal: (show) => set({ showLogoutConfirmModal: show }),

  setShowDeleteConversationModal: (show) =>
    set({ showDeleteConversationModal: show }),

  setConversationToDelete: (conversation) =>
    set({ conversationToDelete: conversation }),

  setIsDeleting: (deleting) => set({ isDeleting: deleting }),

  setHeaderMenuOpen: (open) => set({ headerMenuOpen: open }),

  toggleHeaderMenu: () =>
    set((state) => ({
      headerMenuOpen: !state.headerMenuOpen,
    })),

  resetLogoutState: () =>
    set({
      isLoggingOut: false,
      logoutSuccess: false,
      showLogoutConfirmModal: false,
    }),

  resetDeleteConversationState: () =>
    set({
      showDeleteConversationModal: false,
      conversationToDelete: null,
      isDeleting: false,
    }),
}));
