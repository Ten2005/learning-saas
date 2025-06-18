import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  isLoggingOut: boolean;
  logoutSuccess: boolean;
  showConfirmModal: boolean;
  showDeleteConversationModal: boolean;
  conversationToDelete: { id: string; title: string } | null;
  isDeleting: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoggingOut: (loading: boolean) => void;
  setLogoutSuccess: (success: boolean) => void;
  setShowConfirmModal: (show: boolean) => void;
  setShowDeleteConversationModal: (show: boolean) => void;
  setConversationToDelete: (conversation: { id: string; title: string } | null) => void;
  setIsDeleting: (deleting: boolean) => void;
  resetLogoutState: () => void;
  resetDeleteConversationState: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  isLoggingOut: false,
  logoutSuccess: false,
  showConfirmModal: false,
  showDeleteConversationModal: false,
  conversationToDelete: null,
  isDeleting: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  setLoggingOut: (loading) => set({ isLoggingOut: loading }),

  setLogoutSuccess: (success) => set({ logoutSuccess: success }),

  setShowConfirmModal: (show) => set({ showConfirmModal: show }),

  setShowDeleteConversationModal: (show) => set({ showDeleteConversationModal: show }),

  setConversationToDelete: (conversation) => set({ conversationToDelete: conversation }),

  setIsDeleting: (deleting) => set({ isDeleting: deleting }),

  resetLogoutState: () =>
    set({
      isLoggingOut: false,
      logoutSuccess: false,
      showConfirmModal: false,
    }),

  resetDeleteConversationState: () =>
    set({
      showDeleteConversationModal: false,
      conversationToDelete: null,
      isDeleting: false,
    }),
}));
