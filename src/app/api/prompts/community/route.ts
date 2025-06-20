import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Fetch only user-submitted prompts (not evolved ones and not AI-generated)
    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("type", "submitted")
      .is("parent_id", null) // Only show original prompts, not evolved ones
      .neq("source", "AI") // Exclude AI-generated prompts
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching community prompts:", error);
      return NextResponse.json(
        { error: "Failed to fetch community prompts" },
        { status: 500 }
      );
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
          ((prompt.text as string)
            ? (prompt.text as string).slice(0, 50) + "..."
            : "Untitled Prompt"),
        content: prompt.content || (prompt.text as string),
        creator: creatorName,
        source: prompt.source || prompt.source_tag || "community",
      };
    });

    return NextResponse.json({ prompts: transformedPrompts });
  } catch (error) {
    console.error("Error in community prompts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
