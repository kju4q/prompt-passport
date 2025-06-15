import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
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
