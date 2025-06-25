"use client";

import { useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useConversationStore } from "@/stores/conversationStore";
import ConversationScreen from "@/app/components/conversation/ConversationScreen";

export default function Chat() {
  const { messages, isLoading, clearMessages } = useChatStore();

  const { setCurrentConversation } = useConversationStore();

  useEffect(() => {
    setCurrentConversation(null);
    clearMessages();
  }, [setCurrentConversation, clearMessages]);

  return <ConversationScreen messages={messages} isLoading={isLoading} />;
}
