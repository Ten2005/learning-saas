import { create } from "zustand";
import { Message } from "@/types";
import { 
  apiRequest, 
  CreateConversationResponseSchema,
  CreateMessageResponseSchema,
  ChatResponseSchema 
} from "@/types/api";
import { useMessageStore } from "./messageStore";
import { toast } from "./toastStore";

interface ChatActionState {
  isLoading: boolean;
  inputValue: string;
  branchPointId: string | null;
  
  setLoading: (loading: boolean) => void;
  setInputValue: (value: string) => void;
  setBranchPoint: (messageId: string | null) => void;
  
  sendMessage: (content: string, conversationId?: string) => Promise<string | undefined>;
  sendMessageFromBranch: (
    content: string, 
    parentId: string, 
    conversationId: string
  ) => Promise<void>;
}

export const useChatActionStore = create<ChatActionState>((set, get) => ({
  isLoading: false,
  inputValue: "",
  branchPointId: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setInputValue: (value) => set({ inputValue: value }),
  setBranchPoint: (messageId) => set({ branchPointId: messageId }),

  sendMessage: async (content, conversationId) => {
    if (!content.trim()) return;

    const messageStore = useMessageStore.getState();
    const { messages, lastMessageId, addMessage } = messageStore;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    addMessage(userMessage);
    set({ inputValue: "", isLoading: true });

    try {
      let currentConversationId = conversationId;

      // 会話IDがない場合は新規作成
      if (!currentConversationId) {
        const conversationData = await apiRequest(
          "/api/conversation",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: content.substring(0, 50) }),
          },
          CreateConversationResponseSchema
        );

        currentConversationId = conversationData.conversation.id;
        
        // イベント発火
        window.dispatchEvent(new CustomEvent("conversationUpdated"));
        window.dispatchEvent(
          new CustomEvent("conversationCreated", {
            detail: { conversationId: currentConversationId },
          })
        );
      }

      // ユーザーメッセージを保存
      const userMessageData = await apiRequest(
        `/api/conversation/${currentConversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "user",
            content,
            parent_id: lastMessageId,
          }),
        },
        CreateMessageResponseSchema
      );

      const savedUserMessageId = userMessageData.message.id;

      // AI応答を取得
      const responseData = await apiRequest(
        "/api/chat/response",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        },
        ChatResponseSchema
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseData.message,
        role: "assistant",
        timestamp: new Date(),
      };

      addMessage(aiMessage);

      // AI応答を保存
      const aiMessageData = await apiRequest(
        `/api/conversation/${currentConversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "assistant",
            content: responseData.message,
            parent_id: savedUserMessageId,
          }),
        },
        CreateMessageResponseSchema
      );

      messageStore.setLastMessageId(aiMessageData.message.id);
      window.dispatchEvent(new CustomEvent("conversationUpdated"));
      
      toast.success("メッセージを送信しました");
      return currentConversationId;
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("エラーが発生しました", "メッセージの送信に失敗しました。");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "エラーが発生しました。もう一度お試しください。",
        role: "assistant",
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessageFromBranch: async (content, parentId, conversationId) => {
    if (!content.trim()) return;

    const messageStore = useMessageStore.getState();
    const { messages, currentPath, addMessage, setCurrentPath } = messageStore;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    // 分岐ポイントまでのメッセージを取得
    const branchIndex = currentPath.indexOf(parentId);
    if (branchIndex === -1) return;

    const messagesUntilBranch = messages.slice(0, branchIndex + 1);
    const updatedMessages = [...messagesUntilBranch, userMessage];

    // UIを更新
    messageStore.setMessages(updatedMessages);
    setCurrentPath([...currentPath.slice(0, branchIndex + 1), userMessage.id]);
    set({ inputValue: "", branchPointId: null, isLoading: true });

    try {
      // ユーザーメッセージを保存
      const userMessageData = await apiRequest(
        `/api/conversation/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "user",
            content,
            parent_id: parentId,
          }),
        },
        CreateMessageResponseSchema
      );

      const savedUserMessageId = userMessageData.message.id;

      // AI応答を取得
      const responseData = await apiRequest(
        "/api/chat/response",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        },
        ChatResponseSchema
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseData.message,
        role: "assistant",
        timestamp: new Date(),
      };

      addMessage(aiMessage);

      // AI応答を保存
      const aiMessageData = await apiRequest(
        `/api/conversation/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "assistant",
            content: responseData.message,
            parent_id: savedUserMessageId,
          }),
        },
        CreateMessageResponseSchema
      );

      const newPath = [...messageStore.currentPath, aiMessageData.message.id];
      setCurrentPath(newPath);
      messageStore.setLastMessageId(aiMessageData.message.id);

      window.dispatchEvent(new CustomEvent("conversationUpdated"));
      toast.success("分岐から新しいメッセージを送信しました");

      // メッセージを再読み込み
      await messageStore.loadMessagesForPath(conversationId);
      
    } catch (error) {
      console.error("Error sending branch message:", error);
      toast.error("エラーが発生しました", "分岐メッセージの送信に失敗しました。");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "エラーが発生しました。もう一度お試しください。",
        role: "assistant",
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
}));