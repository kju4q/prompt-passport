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
    return NextResponse.json({ tree: evolutions });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
