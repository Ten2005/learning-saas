import { Menu, X } from "lucide-react";
import { SERVICE_NAME } from "@/consts/common";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function DashboardHeader({ onMenuClick, isSidebarOpen }: DashboardHeaderProps) {
  return (
    <div className="bg-background border-b border-foreground/10 p-4 flex items-center relative z-50">
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
  );
} 