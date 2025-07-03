import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // 自動削除
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration || 5000);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

// ヘルパー関数
export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: "success", title, message, duration });
  },
  error: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: "error", title, message, duration });
  },
  warning: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: "warning", title, message, duration });
  },
  info: (title: string, message?: string, duration?: number) => {
    useToastStore.getState().addToast({ type: "info", title, message, duration });
  },
};