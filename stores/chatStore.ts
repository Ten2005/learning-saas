import { create } from "zustand";
import { Message, MessageRecord } from "@/types";

interface ChatState {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  conversationId: string | null;
  lastMessageId: string | null;
  addMessage: (message: Message) => void;
  setInputValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  setConversationId: (id: string | null) => void;
  loadMessagesForConversation: (conversationId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  inputValue: "",
  isLoading: false,
  conversationId: null,
  lastMessageId: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setInputValue: (value) => set({ inputValue: value }),

  setLoading: (loading) => set({ isLoading: loading }),

  setConversationId: (id) => set({ conversationId: id }),

  loadMessagesForConversation: async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/conversation/${conversationId}/messages`,
      );
      const data = await response.json();

      if (response.ok) {
        const messages: Message[] = data.messages.map((msg: MessageRecord) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role as "user" | "assistant",
          timestamp: new Date(msg.created_at),
        }));

        set({
          messages,
          conversationId,
          lastMessageId:
            messages.length > 0 ? messages[messages.length - 1].id : null,
        });
      } else {
        console.error("Error loading messages:", data.error);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  },

  sendMessage: async (content: string) => {
    if (!content.trim()) return;

    const { messages, addMessage, setLoading, conversationId, lastMessageId } =
      get();

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
      let currentConversationId = conversationId;

      // 会話IDがない場合は新規作成
      if (!currentConversationId) {
        const conversationResponse = await fetch("/api/conversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: content.substring(0, 50) }),
        });

        const conversationData = await conversationResponse.json();
        if (conversationResponse.ok) {
          currentConversationId = conversationData.conversation.id;
          set({ conversationId: currentConversationId });

          // 新しい会話が作成されたら会話一覧を更新とページ変更
          window.dispatchEvent(new CustomEvent("conversationUpdated"));
          window.dispatchEvent(
            new CustomEvent("conversationCreated", {
              detail: { conversationId: currentConversationId },
            }),
          );
        } else {
          throw new Error("Failed to create conversation");
        }
      }

      // ユーザーメッセージを保存
      const userMessageResponse = await fetch(
        `/api/conversation/${currentConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "user",
            content,
            parent_id: lastMessageId,
          }),
        },
      );

      const userMessageData = await userMessageResponse.json();
      if (!userMessageResponse.ok) {
        throw new Error("Failed to save user message");
      }

      const savedUserMessageId = userMessageData.message.id;

      // AI応答を取得
      const response = await fetch("/api/chat/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "assistant",
        timestamp: new Date(),
      };

      addMessage(aiMessage);

      // AI応答を保存
      const aiMessageResponse = await fetch(
        `/api/conversation/${currentConversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "assistant",
            content: data.message,
            parent_id: savedUserMessageId,
          }),
        },
      );

      const aiMessageData = await aiMessageResponse.json();
      if (aiMessageResponse.ok) {
        set({ lastMessageId: aiMessageData.message.id });

        // 会話一覧を更新するため、window.dispatchEventを使用
        window.dispatchEvent(new CustomEvent("conversationUpdated"));
      }
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

  clearMessages: () =>
    set({
      messages: [],
      conversationId: null,
      lastMessageId: null,
    }),
}));
