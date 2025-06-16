"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import InputArea from "@/app/components/common/InputArea";
import MessageLoading from "@/app/components/conversation/MessageLoading";
import Message from "@/app/components/conversation/Message";
import { useChatStore } from "@/stores/chatStore";
import { useConversationStore } from "@/stores/conversationStore";

export default function Chat() {
  const params = useParams();
  const router = useRouter();
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
    if (conversationId && conversationId !== "new") {
      setConversationId(conversationId);
      setCurrentConversation(conversationId);
      loadMessagesForConversation(conversationId);
    } else {
      // 新しい会話の場合はクリア
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

  useEffect(() => {
    // 新しい会話が作成されたらリダイレクト
    const handleConversationCreated = (event: CustomEvent) => {
      const { conversationId: newConversationId } = event.detail;
      if (conversationId === "new") {
        router.replace(`/chat/${newConversationId}`);
      }
    };

    window.addEventListener(
      "conversationCreated",
      handleConversationCreated as EventListener,
    );

    return () => {
      window.removeEventListener(
        "conversationCreated",
        handleConversationCreated as EventListener,
      );
    };
  }, [conversationId, router]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-foreground/60">
            <p>会話を始めましょう...</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} role={message.role} />
          ))
        )}
        {isLoading && <MessageLoading />}
      </div>

      <InputArea />
    </div>
  );
}
