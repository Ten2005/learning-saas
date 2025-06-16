import { create } from "zustand";
import { Conversation } from "@/types";

interface ConversationState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  fetchConversations: () => Promise<void>;
  createNewConversation: (title?: string) => Promise<string | null>;
  setCurrentConversation: (id: string | null) => void;
  clearConversations: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  currentConversationId: null,
  isLoading: false,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/conversation");
      const data = await response.json();

      if (response.ok) {
        set({ conversations: data.conversations });
      } else {
        console.error("Error fetching conversations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createNewConversation: async (title?: string) => {
    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (response.ok) {
        const { conversations } = get();
        set({
          conversations: [data.conversation, ...conversations],
          currentConversationId: data.conversation.id,
        });
        return data.conversation.id;
      } else {
        console.error("Error creating conversation:", data.error);
        return null;
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  },

  setCurrentConversation: (id) => {
    set({ currentConversationId: id });
  },

  clearConversations: () => {
    set({ conversations: [], currentConversationId: null });
  },
}));
