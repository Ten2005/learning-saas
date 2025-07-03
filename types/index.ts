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

export interface Conversation {
  id: string;
  user_id: string;
  started_at: string;
  is_deleted: boolean;
  title: string | null;
  model: string;
  system_prompt: string | null;
  language: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  parent_id: string | null;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  is_deleted: boolean;
}

// API関連の型をre-export
export * from './api';
