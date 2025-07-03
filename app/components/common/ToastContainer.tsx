"use client";

import { useToastStore } from "@/stores/toastStore";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const toastIcons = {
  success: <CheckCircle className="w-5 h-5 text-green-600" />,
  error: <AlertCircle className="w-5 h-5 text-red-600" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  info: <Info className="w-5 h-5 text-blue-600" />,
};

const toastStyles = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  warning: "bg-yellow-50 border-yellow-200",
  info: "bg-blue-50 border-blue-200",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`
              flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm
              ${toastStyles[toast.type]}
            `}
          >
            <div className="flex-shrink-0">{toastIcons[toast.type]}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{toast.title}</h4>
              {toast.message && (
                <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}