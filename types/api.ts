import { z } from "zod";
import { Conversation, MessageRecord } from "./index";

// Zodスキーマ定義
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  started_at: z.string().datetime(),
  is_deleted: z.boolean(),
  title: z.string().nullable(),
  model: z.string(),
  system_prompt: z.string().nullable(),
  language: z.string(),
});

export const MessageRecordSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  created_at: z.string().datetime(),
  is_deleted: z.boolean(),
});

// APIレスポンス型定義
export const CreateConversationResponseSchema = z.object({
  conversation: ConversationSchema,
  error: z.string().optional(),
});

export const GetConversationsResponseSchema = z.object({
  conversations: z.array(ConversationSchema),
  error: z.string().optional(),
});

export const CreateMessageResponseSchema = z.object({
  message: MessageRecordSchema,
  error: z.string().optional(),
});

export const GetMessagesResponseSchema = z.object({
  messages: z.array(MessageRecordSchema),
  error: z.string().optional(),
});

export const ChatResponseSchema = z.object({
  message: z.string(),
  error: z.string().optional(),
});

export const DeleteResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// 型エクスポート
export type CreateConversationResponse = z.infer<typeof CreateConversationResponseSchema>;
export type GetConversationsResponse = z.infer<typeof GetConversationsResponseSchema>;
export type CreateMessageResponse = z.infer<typeof CreateMessageResponseSchema>;
export type GetMessagesResponse = z.infer<typeof GetMessagesResponseSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;

// APIエラー型
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

// APIリクエストヘルパー
export async function apiRequest<T>(
  url: string,
  options?: RequestInit,
  schema?: z.ZodSchema<T>
): Promise<T> {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        response.status,
        data.error || `HTTP error! status: ${response.status}`,
        data
      );
    }

    if (schema) {
      return schema.parse(data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof z.ZodError) {
      throw new APIError(400, "Invalid response format", error.errors);
    }
    if (error instanceof Error) {
      throw new APIError(500, "Network error", error.message);
    }
    throw new APIError(500, "Unknown error", error);
  }
}