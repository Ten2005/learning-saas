import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// 特定の会話のメッセージ一覧を取得
export async function GET(request: NextRequest, context: RouteContext) {
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

    // メッセージを取得
    const { data: messages, error } = await supabase
      .from("message")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error in GET /api/conversation/[id]/messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 新しいメッセージを保存
export async function POST(request: NextRequest, context: RouteContext) {
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

    const { role, content, parent_id } = await request.json();

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

    // メッセージを挿入
    const { data: message, error } = await supabase
      .from("message")
      .insert({
        conversation_id: conversationId,
        parent_id,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating message:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }

    // 閉包テーブルを更新
    await updateMessageClosure(supabase, message.id, parent_id);

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error in POST /api/conversation/[id]/messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 閉包テーブルを更新する関数
async function updateMessageClosure(
  supabase: Awaited<ReturnType<typeof createClient>>,
  messageId: string,
  parentId: string | null,
) {
  try {
    // 自分自身のエントリを追加
    await supabase.from("message_closure").insert({
      ancestor_id: messageId,
      descendant_id: messageId,
      depth: 0,
    });

    // 親が存在する場合、親の祖先との関係を追加
    if (parentId) {
      const { data: ancestors, error } = await supabase
        .from("message_closure")
        .select("ancestor_id, depth")
        .eq("descendant_id", parentId);

      if (error) {
        console.error("Error fetching ancestors:", error);
        return;
      }

      for (const ancestor of ancestors) {
        await supabase.from("message_closure").insert({
          ancestor_id: ancestor.ancestor_id,
          descendant_id: messageId,
          depth: ancestor.depth + 1,
        });
      }
    }
  } catch (error) {
    console.error("Error updating message closure:", error);
  }
}
