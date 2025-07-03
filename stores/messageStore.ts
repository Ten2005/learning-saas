import { create } from "zustand";
import { Message, MessageRecord } from "@/types";
import { apiRequest, GetMessagesResponseSchema } from "@/types/api";

interface MessageState {
  messages: Message[];
  currentPath: string[];
  availableBranches: Map<string, MessageRecord[]>;
  lastMessageId: string | null;
  
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setCurrentPath: (path: string[]) => void;
  setAvailableBranches: (branches: Map<string, MessageRecord[]>) => void;
  setLastMessageId: (id: string | null) => void;
  
  loadMessagesForPath: (conversationId: string, path?: string[]) => Promise<void>;
  buildMessageTree: (messages: MessageRecord[]) => {
    pathMessages: Message[];
    branches: Map<string, MessageRecord[]>;
    currentPath: string[];
  };
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  currentPath: [],
  availableBranches: new Map(),
  lastMessageId: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  clearMessages: () => set({ messages: [], currentPath: [], lastMessageId: null }),
  setCurrentPath: (path) => set({ currentPath: path }),
  setAvailableBranches: (branches) => set({ availableBranches: branches }),
  setLastMessageId: (id) => set({ lastMessageId: id }),

  buildMessageTree: (allMessages) => {
    const messageMap = new Map<string, MessageRecord>();
    const childrenMap = new Map<string, MessageRecord[]>();
    const branches = new Map<string, MessageRecord[]>();

    // メッセージを親子関係でマップ化
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

    // 最新のパスを構築
    let currentPath: string[] = [];
    const rootMessages = allMessages.filter((msg) => !msg.parent_id);
    
    if (rootMessages.length > 0) {
      let currentMsg = rootMessages[0];
      currentPath.push(currentMsg.id);

      // 最新のパスをたどる
      while (childrenMap.has(currentMsg.id)) {
        const children = childrenMap.get(currentMsg.id)!;
        currentMsg = children.reduce((latest, child) =>
          new Date(child.created_at) > new Date(latest.created_at) ? child : latest
        );
        currentPath.push(currentMsg.id);
      }
    }

    // パスに基づいてメッセージをフィルター
    const pathSet = new Set(currentPath);
    const pathMessages = allMessages
      .filter((msg) => pathSet.has(msg.id))
      .map((msg) => ({
        id: msg.id,
        content: msg.content,
        role: msg.role as "user" | "assistant",
        timestamp: new Date(msg.created_at),
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return { pathMessages, branches, currentPath };
  },

  loadMessagesForPath: async (conversationId, path) => {
    try {
      const data = await apiRequest(
        `/api/conversation/${conversationId}/messages`,
        undefined,
        GetMessagesResponseSchema
      );

      if (data.messages) {
        const { pathMessages, branches, currentPath } = get().buildMessageTree(data.messages);
        
        // 指定されたパスがある場合はそれを使用
        if (path && path.length > 0) {
          const pathSet = new Set(path);
          const filteredMessages = pathMessages.filter(msg => pathSet.has(msg.id));
          set({
            messages: filteredMessages,
            currentPath: path,
            availableBranches: branches,
            lastMessageId: path[path.length - 1] || null,
          });
        } else {
          set({
            messages: pathMessages,
            currentPath,
            availableBranches: branches,
            lastMessageId: currentPath[currentPath.length - 1] || null,
          });
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      throw error;
    }
  },
}));