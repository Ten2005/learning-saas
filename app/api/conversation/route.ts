import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// 会話一覧を取得
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: conversations, error } = await supabase
      .from("conversation")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .order("started_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error in GET /api/conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 新しい会話を作成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await request.json();

    const { data: conversation, error } = await supabase
      .from("conversation")
      .insert({
        user_id: user.id,
        title,
        model: "gpt-4",
        language: "ja",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Error in POST /api/conversation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
