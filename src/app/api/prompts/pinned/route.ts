import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { nullifier_hash } = await req.json();
    if (!nullifier_hash) {
      return NextResponse.json(
        { error: "Missing nullifier_hash" },
        { status: 400 }
      );
    }
    // Get all pinned prompt IDs for this user
    const { data: pinned, error: pinError } = await supabase
      .from("pinned")
      .select("prompt_id")
      .eq("nullifier_hash", nullifier_hash);
    if (pinError) {
      console.error("PINNED API pinError:", pinError);
      return NextResponse.json({ error: pinError.message }, { status: 500 });
    }
    const promptIds = pinned.map((p: any) => p.prompt_id);
    if (promptIds.length === 0) return NextResponse.json({ prompts: [] });
    // Fetch the prompt details
    const { data: prompts, error: promptError } = await supabase
      .from("prompts")
      .select("*")
      .in("id", promptIds);
    if (promptError) {
      console.error("PINNED API promptError:", promptError);
      return NextResponse.json({ error: promptError.message }, { status: 500 });
    }
    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("PINNED API catch error:", error);
    return NextResponse.json(
      { error: error?.toString() || "Internal server error" },
      { status: 500 }
    );
  }
}
