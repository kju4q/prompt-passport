import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Fetch prompts where type is 'submitted' (user-submitted prompts)
    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("type", "submitted")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching community prompts:", error);
      return NextResponse.json(
        { error: "Failed to fetch community prompts" },
        { status: 500 }
      );
    }

    // Transform the data to ensure compatibility with PromptCard
    const transformedPrompts = prompts.map((prompt: any) => ({
      ...prompt,
      // Ensure we have the expected fields
      title:
        prompt.title ||
        (prompt.text ? prompt.text.slice(0, 50) + "..." : "Untitled Prompt"),
      content: prompt.content || prompt.text,
      creator: prompt.creator || prompt.created_by || "Edge Esmeralda",
      source: prompt.source || prompt.source_tag || "community",
    }));

    return NextResponse.json({ prompts: transformedPrompts });
  } catch (error) {
    console.error("Error in community prompts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
