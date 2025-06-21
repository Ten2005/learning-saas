"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const { user, isLoading, isAuthenticated, initialize } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    return null;
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
