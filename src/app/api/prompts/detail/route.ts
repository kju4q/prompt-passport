import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const { data: prompt, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "PGRST116") {
        // Not found
        return NextResponse.json(
          { error: "Prompt not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // Transform the data to ensure compatibility with PromptCard
    const transformedPrompt = {
      ...prompt,
      // Ensure we have the expected fields
      title:
        prompt.title ||
        ((prompt.text as string)
          ? (prompt.text as string).slice(0, 50) + "..."
          : "Untitled Prompt"),
      content: prompt.content || (prompt.text as string),
      creator: prompt.creator || prompt.created_by || "Edge Esmeralda",
      source: prompt.source || prompt.source_tag || "community",
    };

    return NextResponse.json({ prompt: transformedPrompt });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
