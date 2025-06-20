import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    // Get all evolutions that are descendants of the root prompt
    // This includes the root prompt and all its children recursively
    const { data: allPrompts, error } = await supabase
      .from("prompts")
      .select("*")
      .or(`id.eq.${id},parent_id.eq.${id}`)
      .order("generation", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!allPrompts || allPrompts.length === 0) {
      return NextResponse.json({
        tree: [],
      });
    }

    // Get all evolutions that have any of the prompts as parent
    const promptIds = allPrompts.map((p: any) => p.id);
    const { data: childEvolutions, error: childError } = await supabase
      .from("prompts")
      .select("*")
      .in("parent_id", promptIds)
      .order("generation", { ascending: true });

    if (childError) {
      console.error("Child evolution error:", childError);
      return NextResponse.json({ error: childError.message }, { status: 500 });
    }

    // Combine all evolutions
    const allEvolutions = [...(allPrompts || []), ...(childEvolutions || [])];

    // Transform the data to ensure compatibility with PromptCard
    const transformedEvolutions = allEvolutions.map((evolution: any) => ({
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

    console.log("Evolution tree data:", {
      rootId: id,
      totalEvolutions: transformedEvolutions.length,
      evolutions: transformedEvolutions.map((e: any) => ({
        id: e.id,
        parent_id: e.parent_id,
        generation: e.generation,
      })),
    });

    return NextResponse.json({ tree: transformedEvolutions });
  } catch (err) {
    console.error("Evolution tree error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
