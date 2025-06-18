import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  message: string;
  cancelText?: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmButtonVariant?: "default" | "danger";
  maxWidth?: "sm" | "md" | "lg";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  cancelText = "キャンセル",
  confirmText,
  onCancel,
  onConfirm,
  confirmButtonVariant = "default",
  maxWidth = "sm",
}: ModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
  };

  const confirmButtonClasses =
    confirmButtonVariant === "danger"
      ? "px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
      : "px-4 py-2 rounded-md bg-foreground/80 text-background hover:bg-foreground/90 transition-colors duration-200";

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
      onClick={handleBackdropClick}
    >
      <div className={`bg-background border border-foreground/20 rounded-lg p-6 ${maxWidthClasses[maxWidth]} w-full mx-4 shadow-lg`}>
        <h3 className="text-lg font-semibold mb-4 text-foreground">
          {title}
        </h3>
        <p className="text-foreground/80 mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="
              px-4 py-2 rounded-md border border-foreground/20
              text-foreground/80 hover:text-foreground
              hover:bg-foreground/5 transition-colors duration-200
            "
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={confirmButtonClasses}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
} 