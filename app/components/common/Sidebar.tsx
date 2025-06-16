"use client";

import { Plus, MessageCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/conversationStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    conversations,
    isLoading,
    fetchConversations,
    setCurrentConversation,
  } = useConversationStore();

  useEffect(() => {
    fetchConversations();

    // 会話更新イベントをリッスン
    const handleConversationUpdate = () => {
      fetchConversations();
    };

    window.addEventListener("conversationUpdated", handleConversationUpdate);

    return () => {
      window.removeEventListener(
        "conversationUpdated",
        handleConversationUpdate,
      );
    };
  }, [fetchConversations]);

  const handleLinkClick = () => {
    // モバイルでのみサイドバーを閉じる
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleNewConversation = () => {
    router.push("/chat/new");
    handleLinkClick();
  };

  const handleConversationClick = (conversationId: string) => {
    setCurrentConversation(conversationId);
    router.push(`/chat/${conversationId}`);
    handleLinkClick();
  };

  return (
    <>
      {/* Mobile overlay - only shown on mobile */}
      {isOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 top-[4.5rem] bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 z-50 w-64 bg-background border-r border-foreground/10 transform transition-transform duration-300 ease-in-out",
          "top-[4.5rem] bottom-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4 h-full flex flex-col">
          {/* 新しい会話ボタン */}
          <button
            onClick={handleNewConversation}
            className="flex items-center w-full px-3 py-2 mb-4 rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-3 h-4 w-4" />
            新しい会話
          </button>

          {/* 会話リスト */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-medium text-foreground/60 mb-2">
              会話履歴
            </h3>
            {isLoading ? (
              <div className="text-sm text-foreground/60">読み込み中...</div>
            ) : conversations.length === 0 ? (
              <div className="text-sm text-foreground/60">会話がありません</div>
            ) : (
              <ul className="space-y-1">
                {conversations.map((conversation) => {
                  const isActive = pathname === `/chat/${conversation.id}`;
                  const displayTitle = conversation.title || "新しい会話";

                  return (
                    <li key={conversation.id}>
                      <button
                        onClick={() => handleConversationClick(conversation.id)}
                        className={cn(
                          "flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                          isActive
                            ? "bg-primary/20 text-foreground"
                            : "text-foreground/70 hover:text-foreground hover:bg-foreground/10",
                        )}
                      >
                        <MessageCircle className="mr-3 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{displayTitle}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
