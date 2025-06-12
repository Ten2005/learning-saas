"use client";

import { Menu, X, LogOut, Check } from "lucide-react";
import { SERVICE_NAME } from "@/consts/common";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function DashboardHeader({
  onMenuClick,
  isSidebarOpen,
}: DashboardHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirmModal(true);
  };

  const handleLogoutConfirm = async () => {
    if (isLoggingOut || logoutSuccess) return;

    setShowConfirmModal(false);
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      setIsLoggingOut(false);
      setLogoutSuccess(true);

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 800);
    } catch (error) {
      console.error("ログアウトエラー:", error);
      setIsLoggingOut(false);
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

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-background border border-foreground/20 rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              ログアウトの確認
            </h3>
            <p className="text-foreground/80 mb-6">
              本当にログアウトしますか？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleLogoutCancel}
                className="
                  px-4 py-2 rounded-md border border-foreground/20
                  text-foreground/80 hover:text-foreground
                  hover:bg-foreground/5 transition-colors duration-200
                "
              >
                キャンセル
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="
                  px-4 py-2 rounded-md bg-foreground/80 text-background
                  hover:bg-foreground/90 transition-colors duration-200
                "
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
