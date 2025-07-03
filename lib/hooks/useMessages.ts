import { useEffect } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { useChatActionStore } from "@/stores/chatActionStore";
import { toast } from "@/stores/toastStore";

export function useMessages(conversationId?: string) {
  const { 
    messages, 
    currentPath, 
    availableBranches,
    loadMessagesForPath,
    clearMessages 
  } = useMessageStore();
  
  const { 
    isLoading,
    inputValue,
    branchPointId,
    setInputValue,
    setBranchPoint,
    sendMessage,
    sendMessageFromBranch
  } = useChatActionStore();

  useEffect(() => {
    if (conversationId) {
      loadMessagesForPath(conversationId).catch((error) => {
        console.error("Failed to load messages:", error);
        toast.error("メッセージの読み込みに失敗しました");
      });
    }
    
    return () => {
      // クリーンアップ
      if (!conversationId) {
        clearMessages();
      }
    };
  }, [conversationId, loadMessagesForPath, clearMessages]);

  const handleSendMessage = async (content: string) => {
    if (branchPointId) {
      await sendMessageFromBranch(content, branchPointId, conversationId!);
    } else {
      await sendMessage(content, conversationId);
    }
  };

  const switchToBranch = async (branchPath: string[]) => {
    if (!conversationId) return;
    
    try {
      await loadMessagesForPath(conversationId, branchPath);
      toast.success("ブランチを切り替えました");
    } catch (error) {
      console.error("Failed to switch branch:", error);
      toast.error("ブランチの切り替えに失敗しました");
    }
  };

  return {
    messages,
    currentPath,
    availableBranches,
    isLoading,
    inputValue,
    branchPointId,
    setInputValue,
    setBranchPoint,
    sendMessage: handleSendMessage,
    switchToBranch,
  };
}