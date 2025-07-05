"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import ConversationScreen from "@/app/components/conversation/ConversationScreen";
import { useConversationStore } from "@/stores/conversationStore";

export default function Chat() {
  const params = useParams();
  const pathConversasionId = params.id as string;
  const { messages, isLoading, loadMessagesForConversation, clearMessages } =
    useChatStore();

  const { setCurrentConversation } = useConversationStore();

  useEffect(() => {
    if (pathConversasionId) {
      clearMessages();
      setCurrentConversation(pathConversasionId);
      loadMessagesForConversation(pathConversasionId);
    } else {
      setCurrentConversation(null);
      clearMessages();
    }
  }, [loadMessagesForConversation, clearMessages, pathConversasionId]);

  return <ConversationScreen messages={messages} isLoading={isLoading} />;
}
