import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    // 1) Fetch root prompt
    const { data: rootPrompt, error: rootError } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();

    if (rootError) {
      if ((rootError as any).code === "PGRST116") {
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
      }
      console.error("Root fetch error:", rootError);
      return NextResponse.json({ error: rootError.message }, { status: 500 });
    }

    if (!rootPrompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    // 2) Iteratively fetch all descendants (BFS) to any depth
    const seenIds = new Set<string>([id]);
    const allNodes: any[] = [rootPrompt];
    let currentLevel: string[] = [id];

    // Safety guards to avoid runaway loops
    const MAX_LEVELS = 20;
    const MAX_NODES = 2000;
    let level = 0;

    while (currentLevel.length > 0 && level < MAX_LEVELS && allNodes.length < MAX_NODES) {
      // Fetch children of all nodes in current level
      const parentIds = currentLevel.filter(Boolean);
      if (parentIds.length === 0) break;

      const { data: children, error: fetchError } = await supabase
        .from("prompts")
        .select("*")
        .in("parent_id", parentIds);

      if (fetchError) {
        console.error("Evolution fetch error (level", level, "):", fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      const newChildren = (children || []).filter((c: any) => !seenIds.has(c.id));
      newChildren.forEach((c: any) => seenIds.add(c.id));
      allNodes.push(...newChildren);
      currentLevel = newChildren.map((c: any) => c.id);
      level += 1;
    }

    // 3) Sort by generation then created_at to have stable ordering
    const allEvolutions = allNodes.sort((a: any, b: any) => {
      const genA = a.generation ?? 0;
      const genB = b.generation ?? 0;
      if (genA !== genB) return genA - genB;
      const tA = new Date(a.created_at || 0).getTime();
      const tB = new Date(b.created_at || 0).getTime();
      return tA - tB;
    });

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
      levelsFetched: level,
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
