"use client";

import { useChatStore } from "@/stores/chatStore";
import { useConversationStore } from "@/stores/conversationStore";
import { MessageRecord } from "@/types";

interface BranchNavigatorProps {
  messageId: string;
  onClose: () => void;
}

export default function BranchNavigator({
  messageId,
  onClose,
}: BranchNavigatorProps) {
  const { availableBranches, currentPath, switchToBranch } = useChatStore();
  const { currentConversationId } = useConversationStore();

  const branches = availableBranches.get(messageId);
  if (!branches || branches.length <= 1) return null;

  const handleBranchSwitch = (branch: MessageRecord) => {
    // 新しいパスを構築
    const messageIndex = currentPath.indexOf(messageId);
    if (messageIndex === -1 || !currentConversationId) return;

    const newPath = [...currentPath.slice(0, messageIndex + 1), branch.id];
    switchToBranch(newPath, currentConversationId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">分岐を選択</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[60vh]">
          {branches.map((branch, index) => {
            const isCurrentBranch = currentPath.includes(branch.id);
            return (
              <button
                key={branch.id}
                onClick={() => handleBranchSwitch(branch)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  isCurrentBranch
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-2 h-2 rounded-full ${
                      isCurrentBranch ? "bg-blue-500" : "bg-gray-400"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                      分岐 {index + 1} {isCurrentBranch && "(現在の分岐)"}
                    </div>
                    <div className="text-sm">
                      {branch.content.length > 100
                        ? branch.content.substring(0, 100) + "..."
                        : branch.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(branch.created_at).toLocaleString("ja-JP")}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
