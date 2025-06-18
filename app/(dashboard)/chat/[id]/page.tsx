"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChatStore } from "@/stores/chatStore";
import { useConversationStore } from "@/stores/conversationStore";
import ConversationScreen from "@/app/components/conversation/ConversationScreen";

export default function Chat() {
  const params = useParams();
  const conversationId = params?.id as string;

  const {
    messages,
    isLoading,
    setConversationId,
    loadMessagesForConversation,
    clearMessages,
  } = useChatStore();

  const { setCurrentConversation } = useConversationStore();

  useEffect(() => {
    if (conversationId) {
      setConversationId(conversationId);
      setCurrentConversation(conversationId);
      loadMessagesForConversation(conversationId);
    } else {
      setConversationId(null);
      setCurrentConversation(null);
      clearMessages();
    }
  }, [
    conversationId,
    setConversationId,
    setCurrentConversation,
    loadMessagesForConversation,
    clearMessages,
  ]);

  return <ConversationScreen messages={messages} isLoading={isLoading} />;
}
