"use client";

import { useEffect } from "react";
import Sidebar from "@/app/components/common/Sidebar";
import DashboardHeader from "@/app/components/common/DashboardHeader";
import LoadingSpinner from "@/app/components/common/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, initialize } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ミドルウェアで既に認証チェックが行われているため、
  // ここでは認証状態の初期化のみを行い、リダイレクトは行わない
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onMenuClick={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />
        <main
          className={`flex-1 overflow-hidden transition-all duration-300 ease-in-out ${
            sidebarOpen ? "lg:ml-64" : "ml-0"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
