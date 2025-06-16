import { NextRequest, NextResponse } from "next/server";
import getResponse from "@/utils/getResponse";
import { DEFAULT_MODEL, DEFAULT_SYSTEM_MESSAGE } from "@/consts/common";
import { Message, ChatMessage } from "@/types";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  const chatMessages: ChatMessage[] = messages.map((msg: Message) => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await getResponse(
    chatMessages,
    DEFAULT_MODEL,
    DEFAULT_SYSTEM_MESSAGE,
  );
  return NextResponse.json({ message: response });
}
