"use client";

import { useState } from "react";
import Message from "@/app/components/conversation/Message";
import MessageLoading from "@/app/components/conversation/MessageLoading";
import InputArea from "@/app/components/common/InputArea";
import BranchNavigator from "@/app/components/conversation/BranchNavigator";
import { Message as MessageType } from "@/types";

export default function ConversationScreen({
  messages,
  isLoading,
}: {
  messages: MessageType[];
  isLoading: boolean;
}) {
  const [showBranchNavigator, setShowBranchNavigator] = useState<string | null>(
    null,
  );
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-foreground/60">
            <p>会話を始めましょう...</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              role={message.role}
              onShowBranches={(messageId) => setShowBranchNavigator(messageId)}
            />
          ))
        )}
        {isLoading && <MessageLoading />}
      </div>

      {/* 常にInputAreaを表示 */}
      <InputArea />

      {/* 分岐ナビゲーター */}
      {showBranchNavigator && (
        <BranchNavigator
          messageId={showBranchNavigator}
          onClose={() => setShowBranchNavigator(null)}
        />
      )}
    </div>
  );
}
