import { create } from "zustand";
import { Message, MessageRecord } from "@/types";

interface ChatState {
  messages: Message[];
  inputValue: string;
  isLoading: boolean;
  lastMessageId: string | null;
  currentPath: string[]; // 現在の会話パス（メッセージIDのリスト）
  branchPointId: string | null; // 分岐ポイントのメッセージID
  availableBranches: Map<string, MessageRecord[]>; // 各メッセージからの分岐
  addMessage: (message: Message) => void;
  setInputValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  sendMessage: (content: string, conversationId: string) => Promise<void>;
  sendMessageFromBranch: (
    content: string,
    parentId: string,
    conversationId: string,
  ) => Promise<void>;
  clearMessages: () => void;
  loadMessagesForConversation: (conversationId: string) => Promise<void>;
  setCurrentPath: (path: string[]) => void;
  setBranchPoint: (messageId: string | null) => void;
  switchToBranch: (branchPath: string[], conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  inputValue: "",
  isLoading: false,
  lastMessageId: null,
  currentPath: [],
  branchPointId: null,
  availableBranches: new Map(),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setInputValue: (value) => set({ inputValue: value }),

  setLoading: (loading) => set({ isLoading: loading }),

  setCurrentPath: (path) => set({ currentPath: path }),

  setBranchPoint: (messageId) => set({ branchPointId: messageId }),

  switchToBranch: (branchPath, conversationId) => {
    if (!conversationId) return;

    // 分岐パスに基づいてメッセージを再構築
    set({ currentPath: branchPath });
    get().loadMessagesForConversation(conversationId);
  },

  loadMessagesForConversation: async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/conversation/${conversationId}/messages`,
      );
      const data = await response.json();

      set({ currentPath: [], availableBranches: new Map() });

      if (response.ok) {
        // すべてのメッセージを取得
        const allMessages: MessageRecord[] = data.messages;

        // メッセージを親子関係でマップ化
        const messageMap = new Map<string, MessageRecord>();
        const childrenMap = new Map<string, MessageRecord[]>();
        const branches = new Map<string, MessageRecord[]>();

        allMessages.forEach((msg) => {
          messageMap.set(msg.id, msg);
          if (msg.parent_id) {
            if (!childrenMap.has(msg.parent_id)) {
              childrenMap.set(msg.parent_id, []);
            }
            childrenMap.get(msg.parent_id)!.push(msg);
          }
        });

        // 各メッセージの子（分岐）を記録
        childrenMap.forEach((children, parentId) => {
          if (children.length > 1) {
            branches.set(parentId, children);
          }
        });

        // 現在のパスがない場合は、最新のパスを構築
        let currentPath = get().currentPath;
        if (currentPath.length === 0) {
          // ルートメッセージを見つける
          const rootMessages = allMessages.filter((msg) => !msg.parent_id);
          if (rootMessages.length > 0) {
            currentPath = [];
            let currentMsg = rootMessages[0];
            currentPath.push(currentMsg.id);

            // 最新のパスをたどる（各分岐で最新のメッセージを選択）
            while (childrenMap.has(currentMsg.id)) {
              const children = childrenMap.get(currentMsg.id)!;
              // 最新の子メッセージを選択
              currentMsg = children.reduce((latest, child) =>
                new Date(child.created_at) > new Date(latest.created_at)
                  ? child
                  : latest,
              );
              currentPath.push(currentMsg.id);
            }
          }
        }

        // 現在のパスに基づいてメッセージをフィルター
        const pathSet = new Set(currentPath);
        const messages: Message[] = await allMessages
          .filter((msg) => pathSet.has(msg.id))
          .map((msg) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role as "user" | "assistant",
            timestamp: new Date(msg.created_at),
          }))
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        if (messages.length === 0) {
          console.log("No messages found");
          return;
        }

        set({
          messages,
          currentPath,
          availableBranches: branches,
          lastMessageId:
            messages.length > 0 ? messages[messages.length - 1].id : null,
        });
        console.log(messages);
      } else {
        console.error("Error loading messages:", data.error);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  },

  sendMessage: async (content: string, conversationId: string) => {
    if (!content.trim()) return;

    const { messages, addMessage, setLoading, lastMessageId } = get();

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

  sendMessageFromBranch: async (
    content: string,
    parentId: string,
    conversationId: string,
  ) => {
    if (!content.trim()) return;

    const { addMessage, setLoading, currentPath } = get();

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
    };

    // 分岐ポイントまでのメッセージを取得
    const branchIndex = currentPath.indexOf(parentId);
    if (branchIndex === -1) return;

    const messagesUntilBranch = get().messages.slice(0, branchIndex + 1);
    const updatedMessages = [...messagesUntilBranch, userMessage];

    // UIを更新
    set({
      messages: updatedMessages,
      currentPath: [...currentPath.slice(0, branchIndex + 1), userMessage.id],
      inputValue: "",
      branchPointId: null,
    });
    setLoading(true);

    try {
      // ユーザーメッセージを保存
      const userMessageResponse = await fetch(
        `/api/conversation/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "user",
            content,
            parent_id: parentId,
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
        `/api/conversation/${conversationId}/messages`,
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
        const newPath = [...get().currentPath, aiMessageData.message.id];
        set({
          lastMessageId: aiMessageData.message.id,
          currentPath: newPath,
        });

        // 会話一覧を更新
        window.dispatchEvent(new CustomEvent("conversationUpdated"));

        // メッセージを再読み込みして分岐情報を更新
        get().loadMessagesForConversation(conversationId);
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
      lastMessageId: null,
    }),
}));
