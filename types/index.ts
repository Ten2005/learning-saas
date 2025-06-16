export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
