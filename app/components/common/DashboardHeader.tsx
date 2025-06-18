"use client";

import { Menu, X, LogOut, Check } from "lucide-react";
import { SERVICE_NAME } from "@/consts/common";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import Modal from "./Modal";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function DashboardHeader({
  onMenuClick,
  isSidebarOpen,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { signOut } = useAuthStore();
  const {
    isLoggingOut,
    logoutSuccess,
    showConfirmModal,
    setLoggingOut,
    setLogoutSuccess,
    setShowConfirmModal,
    resetLogoutState,
  } = useUIStore();

  const handleLogoutClick = () => {
    setShowConfirmModal(true);
  };

  const handleLogoutConfirm = async () => {
    if (isLoggingOut || logoutSuccess) return;

    setShowConfirmModal(false);
    setLoggingOut(true);
    try {
      await signOut();
      setLoggingOut(false);
      setLogoutSuccess(true);

      setTimeout(() => {
        router.push("/");
        router.refresh();
        resetLogoutState();
      }, 800);
    } catch (error) {
      console.error("ログアウトエラー:", error);
      setLoggingOut(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowConfirmModal(false);
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

        <button
          onClick={handleLogoutClick}
          disabled={isLoggingOut || logoutSuccess}
          className="
            flex items-center gap-2 px-3 py-2 rounded-md 
            hover:bg-foreground/10 text-foreground/80 hover:text-foreground
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
          "
          aria-label="ログアウト"
        >
          {logoutSuccess ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">ログアウト完了</span>
            </>
          ) : isLoggingOut ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground/80" />
              <span className="text-sm">ログアウト中...</span>
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              <span className="text-sm">ログアウト</span>
            </>
          )}
        </button>
      </div>

      <Modal
        isOpen={showConfirmModal}
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
