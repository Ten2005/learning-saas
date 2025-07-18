"use client";

import { MessageSquare, LogOut, MoreVertical } from "lucide-react";
import { useRef, useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";

export default function HeaderMenu() {
  const { headerMenuOpen, setHeaderMenuOpen, setShowLogoutConfirmModal } =
    useUIStore();

  const menuRef = useRef<HTMLDivElement>(null);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setHeaderMenuOpen(false);
      }
    };

    if (headerMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [headerMenuOpen, setHeaderMenuOpen]);

  const handleLogoutClick = () => {
    setHeaderMenuOpen(false);
    setShowLogoutConfirmModal(true);
  };

  const toggleMenu = () => {
    setHeaderMenuOpen(!headerMenuOpen);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="
          p-2 rounded-md hover:bg-foreground/10 text-foreground/80 hover:text-foreground
          transition-colors duration-200
        "
        aria-label="メニューを開く"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {headerMenuOpen && (
        <div
          className="
          absolute right-0 top-full mt-4 w-48 
          bg-background border border-foreground/10 rounded-md shadow-lg
          p-1 z-50 gap-2
        "
        >
          <ButtonItem
            icon={<MessageSquare className="h-4 w-4" />}
            label="フィードバック"
            onClick={() => {}}
          />
          <ButtonItem
            icon={<LogOut className="h-4 w-4" />}
            label="ログアウト"
            onClick={handleLogoutClick}
          />
        </div>
      )}
    </div>
  );
}

function ButtonItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-2 text-left
      hover:bg-foreground/10 text-foreground/80 hover:text-foreground
      transition-colors duration-200"
      onClick={onClick}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
