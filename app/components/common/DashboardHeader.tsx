"use client";

import { Menu, X, Network, MessageCircle } from "lucide-react";
import { SERVICE_NAME } from "@/consts/common";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { useConversationStore } from "@/stores/conversationStore";
import Modal from "./Modal";
import HeaderMenu from "./HeaderMenu";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function DashboardHeader({
  onMenuClick,
  isSidebarOpen,
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuthStore();
  const { currentConversationId } = useConversationStore();
  const {
    isLoggingOut,
    logoutSuccess,
    showLogoutConfirmModal,
    setLoggingOut,
    setLogoutSuccess,
    setShowLogoutConfirmModal,
    resetLogoutState,
  } = useUIStore();

  // ログアウト成功時の遷移処理
  useEffect(() => {
    if (logoutSuccess) {
      // 次のレンダリングサイクル後に遷移
      const timeoutId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          router.push("/");
          router.refresh();
          resetLogoutState();
        });
      });

      return () => cancelAnimationFrame(timeoutId);
    }
  }, [logoutSuccess, router, resetLogoutState]);

  const handleLogoutConfirm = async () => {
    if (isLoggingOut || logoutSuccess) return;

    setShowLogoutConfirmModal(false);
    setLoggingOut(true);
    try {
      await signOut();
      setLoggingOut(false);
      setLogoutSuccess(true);
    } catch (error) {
      console.error("ログアウトエラー:", error);
      setLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirmModal(false);
  };

  return (
    <>
      <div className="bg-background border-b border-foreground/10 p-4 flex items-center justify-between relative z-50">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-foreground/10 mr-4"
            aria-label={isSidebarOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <h1 className="text-xl font-bold">{SERVICE_NAME}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* オーバービュー/チャット切り替えボタン */}
          <button
            onClick={() => {
              if (pathname === "/overview") {
                // オーバービューからチャットへ
                if (currentConversationId) {
                  router.push(`/chat/${currentConversationId}`);
                } else {
                  router.push("/chat");
                }
              } else {
                // チャットからオーバービューへ
                router.push("/overview");
              }
            }}
            className="p-2 rounded-md hover:bg-foreground/10 text-foreground/80 hover:text-foreground transition-colors duration-200"
            aria-label={
              pathname === "/overview"
                ? "チャットに戻る"
                : "オーバービューを表示"
            }
          >
            {pathname === "/overview" ? (
              <MessageCircle className="h-5 w-5" />
            ) : (
              <Network className="h-5 w-5" />
            )}
          </button>

          <HeaderMenu />
        </div>
      </div>

      <Modal
        isOpen={showLogoutConfirmModal}
        title="ログアウトの確認"
        message="本当にログアウトしますか？"
        confirmText="ログアウト"
        onCancel={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        confirmButtonVariant="default"
      />
    </>
  );
}
