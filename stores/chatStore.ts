import { create } from "zustand";
import { Message } from "@/types";

interface ChatState {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  addMessage: (message: Message) => void;
  setInputValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  inputValue: "",
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setInputValue: (value) => set({ inputValue: value }),

  setLoading: (loading) => set({ isLoading: loading }),

  sendMessage: async (content: string) => {
    if (!content.trim()) return;

    const { messages, addMessage, setLoading } = get();

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    addMessage(userMessage);
    set({ inputValue: "" });
    setLoading(true);

    try {
      const response = await fetch("/api/chat/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      };

      addMessage(aiMessage);
    } catch (error) {
      console.error("Error calling API:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "エラーが発生しました。もう一度お試しください。",
        role: "assistant",
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  },

  clearMessages: () => set({ messages: [] }),
}));
