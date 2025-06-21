import type { Message } from "@/types";
import { useChatStore } from "@/stores/chatStore";
import { useState } from "react";

export default function Message({
  message,
  role,
  onShowBranches,
}: {
  message: Message;
  role: "user" | "assistant";
  onShowBranches?: (messageId: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { setBranchPoint, availableBranches, currentPath, branchPointId } =
    useChatStore();

  const hasBranches = availableBranches.has(message.id);
  const branchCount = hasBranches
    ? availableBranches.get(message.id)!.length
    : 0;
  const isInCurrentPath = currentPath.includes(message.id);
  const isBranchPoint = branchPointId === message.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親のクリックイベントを防ぐ
    setBranchPoint(message.id);
  };

  const handleBranchIndicatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShowBranches && hasBranches && branchCount > 1) {
      onShowBranches(message.id);
    }
  };

  return (
    <div
      key={message.id}
      className={`flex flex-col ${
        role === "user" ? "items-end" : "items-start"
      } relative group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-2">
        {role === "assistant" && (
          <div className="flex flex-col items-center">
            {/* 分岐インジケーター */}
            {hasBranches && (
              <div
                className="flex items-center gap-1 mb-1 cursor-pointer hover:opacity-80"
                onClick={handleBranchIndicatorClick}
                title="分岐を表示"
              >
                <div className="text-xs text-gray-500">{branchCount} 分岐</div>
                <div className="flex gap-0.5">
                  {Array.from({ length: branchCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isInCurrentPath ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div
          onClick={handleClick}
          className={`p-3 rounded-md max-w-[90%] md:max-w-[80%] break-words cursor-pointer transition-all ${
            role === "user"
              ? "bg-foreground text-background"
              : "bg-foreground/10 text-foreground"
          } ${!isInCurrentPath ? "opacity-50" : ""} ${
            isBranchPoint ? "ring-2 ring-orange-500" : ""
          } ${
            isHovered && !isBranchPoint
              ? "ring-1 ring-gray-300 hover:ring-orange-300"
              : ""
          }`}
          title="クリックして分岐元として選択"
        >
          <p>{message.content}</p>
        </div>

        {role === "user" && (
          <div className="flex flex-col items-center">
            {/* 分岐インジケーター */}
            {hasBranches && (
              <div
                className="flex items-center gap-1 mb-1 cursor-pointer hover:opacity-80"
                onClick={handleBranchIndicatorClick}
                title="分岐を表示"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: branchCount }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isInCurrentPath ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500">{branchCount} 分岐</div>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs opacity-60 mt-1 px-1">
        {message.timestamp.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
}
