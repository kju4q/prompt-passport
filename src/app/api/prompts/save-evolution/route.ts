import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@/app/api/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const sessionUser = session.user as any;
    const walletAddress =
      sessionUser?.address || sessionUser?.wallet_address || "Verified User";

    const { content, parentId, remixType, generation } = await req.json();
    if (!content || !parentId || !remixType || generation === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique string ID for the evolution prompt
    const newPromptId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { data, error } = await supabase
      .from("prompts")
      .insert([
        {
          id: newPromptId,
          text: content,
          parent_id: parentId,
          remix_type: remixType,
          generation,
          type: "submitted",
          usage_count: 0,
          pin_count: 0,
          creator: walletAddress,
          created_by: walletAddress,
          source: "community",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ prompt: data[0] });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
