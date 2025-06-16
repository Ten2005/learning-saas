import { Send } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";

export default function InputArea() {
  const { inputValue, setInputValue, isLoading, sendMessage } = useChatStore();

  const handleSendMessage = () => {
    sendMessage(inputValue);
  };
  return (
    <div className="border-t border-foreground/10 p-4">
      <div className="flex gap-2 h-fit">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="メッセージを入力..."
          className="
          flex-1 p-3 border border-foreground/20 rounded-lg resize-none
          focus:outline-none focus:ring-2 focus:ring-foreground/30
          bg-background text-foreground
          "
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="
          duration-200 mx-2
          flex items-center justify-center
          "
        >
          <Send
            size={24}
            className={`
          text-foreground/60
          ${
            !inputValue.trim() || isLoading
              ? ""
              : "transition-transform hover:scale-110 hover:text-foreground active:scale-110 active:text-foreground"
          }
          `}
          />
        </button>
      </div>
    </div>
  );
}
