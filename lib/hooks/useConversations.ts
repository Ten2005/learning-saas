import { useState, useEffect } from "react";
import { Conversation } from "@/types";
import { apiRequest, GetConversationsResponseSchema } from "@/types/api";
import { toast } from "@/stores/toastStore";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiRequest(
        "/api/conversation",
        undefined,
        GetConversationsResponseSchema
      );

      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      toast.error("会話一覧の取得に失敗しました", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    // イベントリスナーの設定
    const handleUpdate = () => fetchConversations();
    window.addEventListener("conversationUpdated", handleUpdate);

    return () => {
      window.removeEventListener("conversationUpdated", handleUpdate);
    };
  }, []);

  return {
    conversations,
    isLoading,
    error,
    refetch: fetchConversations,
  };
}