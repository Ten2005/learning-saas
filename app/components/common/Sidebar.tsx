"use client";

import { Plus, MessageCircle, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/conversationStore";
import { useUIStore } from "@/stores/uiStore";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

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
    deleteConversation,
    setCurrentConversation,
  } = useConversationStore();

  const {
    showDeleteConversationModal,
    conversationToDelete,
    isDeleting,
    setShowDeleteConversationModal,
    setConversationToDelete,
    setIsDeleting,
    resetDeleteConversationState,
  } = useUIStore();

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
    router.push("/chat");
    handleLinkClick();
  };

  const handleConversationClick = async (conversationId: string) => {
    await setCurrentConversation(conversationId);
    router.push(`/chat/${conversationId}`);
    handleLinkClick();
  };

  const handleDeleteConversationClick = (
    conversationId: string,
    title: string,
  ) => {
    setConversationToDelete({ id: conversationId, title });
    setShowDeleteConversationModal(true);
  };

  const handleDeleteConversationConfirm = async () => {
    if (!conversationToDelete || isDeleting) return;

    setShowDeleteConversationModal(false);
    setIsDeleting(true);

    try {
      const success = await deleteConversation(conversationToDelete.id);

      if (success) {
        if (pathname === `/chat/${conversationToDelete.id}`) {
          router.push("/chat");
        }
      } else {
        alert("会話の削除に失敗しました。もう一度お試しください。");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert("会話の削除中にエラーが発生しました。");
    } finally {
      resetDeleteConversationState();
    }
  };

  const handleDeleteConversationCancel = () => {
    setShowDeleteConversationModal(false);
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
                  const isDeletingThis =
                    isDeleting && conversationToDelete?.id === conversation.id;

                  return (
                    <li key={conversation.id} className="relative group">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            handleConversationClick(conversation.id)
                          }
                          disabled={isDeletingThis}
                          className={cn(
                            "flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                            isActive
                              ? "bg-primary/20 text-foreground"
                              : "text-foreground/70 hover:text-foreground hover:bg-foreground/10",
                            isDeletingThis && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          <MessageCircle className="mr-3 h-4 w-4 flex-shrink-0" />
                          <span className="truncate flex-1">
                            {displayTitle}
                          </span>
                        </button>

                        {/* 削除ボタン */}
                        {!isDeletingThis && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversationClick(
                                conversation.id,
                                displayTitle,
                              );
                            }}
                            className="absolute right-2 p-1 rounded-md text-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="会話を削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                        {/* 削除中インジケーター */}
                        {isDeletingThis && (
                          <div className="absolute right-2 p-1">
                            <LoadingSpinner
                              size="small"
                              className="!border-foreground/20 !border-t-foreground/60"
                            />
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 会話削除確認モーダル */}
      <Modal
        isOpen={showDeleteConversationModal && !!conversationToDelete}
        title="会話の削除確認"
        message={`会話「${conversationToDelete?.title || "新しい会話"}」を削除してもよろしいですか？この操作は元に戻せません。`}
        confirmText="削除"
        onCancel={handleDeleteConversationCancel}
        onConfirm={handleDeleteConversationConfirm}
        confirmButtonVariant="danger"
      />
    </>
  );
}
