interface Message {
  id: string;
  content: string;
  position: "left" | "right";
  timestamp: Date;
}

export default function Message({ message }: { message: Message }) {
  return (
    <div
      key={message.id}
      className={`flex flex-col ${
        message.position === "right" ? "items-end" : "items-start"
      }`}
    >
      <div
        className={`p-3 rounded-md max-w-[90%] md:max-w-[80%] break-words ${
          message.position === "right"
            ? "bg-foreground text-background"
            : "bg-foreground/10 text-foreground"
        }`}
      >
        <p>{message.content}</p>
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
