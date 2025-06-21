import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// 会話を削除（論理削除）
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: conversationId } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 会話が該当ユーザーのものか確認
    const { data: conversation, error: convError } = await supabase
      .from("conversation")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    // 会話を論理削除
    const { error: deleteError } = await supabase
      .from("conversation")
      .update({ is_deleted: true })
      .eq("id", conversationId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting conversation:", deleteError);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/conversation/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
