import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/app/api/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get all pinned prompt IDs for this user
    const { data: pinned, error: pinError } = await supabase
      .from("pinned")
      .select("prompt_id")
      .eq("user_id", session.user.id);
    if (pinError) {
      console.error("PINNED API pinError:", pinError);
      return NextResponse.json({ error: pinError.message }, { status: 500 });
    }
    const promptIds = pinned.map((p: any) => p.prompt_id);
    if (promptIds.length === 0) return NextResponse.json({ prompts: [] });

    // Fetch the prompt details with all necessary fields
    const { data: prompts, error: promptError } = await supabase
      .from("prompts")
      .select("*")
      .in("id", promptIds);
    if (promptError) {
      console.error("PINNED API promptError:", promptError);
      return NextResponse.json({ error: promptError.message }, { status: 500 });
    }

    // Transform the data to ensure compatibility with PromptCard
    const transformedPrompts = prompts.map((prompt: any) => {
      // Format creator name consistently
      let creatorName = prompt.creator || prompt.created_by || "Edge Esmeralda";
      if (creatorName.startsWith("0x")) {
        creatorName = `User ${creatorName.slice(2, 6).toUpperCase()}`;
      }

      return {
        ...prompt,
        // Ensure we have the expected fields
        title:
          prompt.title ||
          (prompt.text ? prompt.text.slice(0, 50) + "..." : "Untitled Prompt"),
        content: prompt.content || prompt.text,
        creator: creatorName,
        source: prompt.source || prompt.source_tag || "community",
      };
    });

    return NextResponse.json({ prompts: transformedPrompts });
  } catch (error) {
    console.error("PINNED API catch error:", error);
    return NextResponse.json(
      { error: error?.toString() || "Internal server error" },
      { status: 500 }
    );
  }
}
