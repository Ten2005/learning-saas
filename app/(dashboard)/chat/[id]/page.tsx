"use client";

import { useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import ConversationScreen from "@/app/components/conversation/ConversationScreen";
import { useConversationStore } from "@/stores/conversationStore";

export default function Chat() {
  const { messages, isLoading, loadMessagesForConversation, clearMessages } =
    useChatStore();

  const { currentConversationId, setCurrentConversation } =
    useConversationStore();

  useEffect(() => {
    if (currentConversationId) {
      clearMessages();
      loadMessagesForConversation(currentConversationId);
    } else {
      setCurrentConversation(null);
      clearMessages();
    }
  }, [currentConversationId, loadMessagesForConversation, clearMessages]);

  return <ConversationScreen messages={messages} isLoading={isLoading} />;
}
