import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const { data: evolutions, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("parent_id", id)
      .order("generation", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!evolutions || evolutions.length === 0) {
      return NextResponse.json({
        tree: evolutions || [],
      });
    }

    // Transform the data to ensure compatibility with PromptCard
    const transformedEvolutions = evolutions.map((evolution: any) => ({
      ...evolution,
      // Ensure we have the expected fields
      title:
        evolution.title ||
        ((evolution.text as string)
          ? (evolution.text as string).slice(0, 50) + "..."
          : "Untitled Prompt"),
      content: evolution.content || (evolution.text as string),
      creator: evolution.creator || evolution.created_by || "Edge Esmeralda",
      source: evolution.source || evolution.source_tag || "community",
    }));

    return NextResponse.json({ tree: transformedEvolutions });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
